package org.cmdbuild.auth;

import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Iterables.isEmpty;
import static com.google.common.collect.Iterables.toArray;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.toMap;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.StringUtils.defaultString;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.cmdbuild.dao.Const.User.ACTIVE;
import static org.cmdbuild.dao.Const.User.DESCRIPTION;
import static org.cmdbuild.dao.Const.User.PRIVILEGED;
import static org.cmdbuild.dao.Const.User.SERVICE;
import static org.cmdbuild.dao.Const.User.USERNAME;
import static org.cmdbuild.dao.guava.Functions.toCard;
import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.OrderByClause.Direction.ASC;
import static org.cmdbuild.dao.query.clause.OrderByClause.Direction.DESC;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.alias.Aliases.as;
import static org.cmdbuild.dao.query.clause.alias.Aliases.canonical;
import static org.cmdbuild.dao.query.clause.join.Over.over;
import static org.cmdbuild.dao.query.clause.where.OperatorAndValues.contains;
import static org.cmdbuild.dao.query.clause.where.OperatorAndValues.eq;
import static org.cmdbuild.dao.query.clause.where.OperatorAndValues.equalsIgnoreCase;
import static org.cmdbuild.dao.query.clause.where.OperatorAndValues.in;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.alwaysTrue;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.and;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.condition;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.not;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.or;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.cmdbuild.auth.logging.LoggingSupport;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.auth.user.UserImpl;
import org.cmdbuild.auth.user.UserImpl.UserImplBuilder;
import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.dao.Const.Role;
import org.cmdbuild.dao.Const.UserRole;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMRelation;
import org.cmdbuild.dao.entry.NullOnErrorOfGetCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.alias.EntryTypeAlias;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.view.CMDataView;

import com.google.common.collect.Lists;

/**
 * Implements user, group and privilege management on top of the DAO layer
 */
public abstract class DBUserFetcher implements UserFetcher, LoggingSupport {

	public static interface Configuration {

		boolean isCaseInsensitive();

	}

	private static final String ROLE_NAME_COLUMN = org.cmdbuild.common.Constants.CODE_ATTRIBUTE;

	/**
	 * Usable by subclasses only.
	 */
	protected DBUserFetcher() {
	}

	protected abstract Configuration configuration();

	protected abstract CMDataView view();

	@Override
	public CMUser fetchUser(final Login login) {
		final CMCard userCard = fetchUserCard(login);
		return (userCard == null) ? null : buildUserFromCard(userCard);
	}

	@Override
	public CMUser fetchUserById(final Long userId) {
		final CMQueryRow row = view().select(anyAttribute(userClass())) //
				.from(userClass()) //
				.where(condition(attribute(userClass(), userClass().getKeyAttributeName()), eq(userId))) //
				.limit(1) //
				.skipDefaultOrdering() //
				.run() //
				.getOnlyRow();
		return buildUserFromCard(row.getCard(userClass()));
	}

	@Override
	public Optional<Long> fetchUserPosition(final long userId) {
		final Long output = view().select(anyAttribute(userClass())) //
				.from(userClass()) //
				.orderBy(attribute(userClass(), userNameAttribute()), ASC) //
				.numbered(condition(attribute(userClass(), userClass().getKeyAttributeName()), eq(userId))) //
				.run() //
				.getOnlyRow() //
				.getNumber() - 1L;
		return Optional.of(output);
	}

	@Override
	public List<CMUser> fetchUsersFromGroupId(final Long groupId) {
		final CMQueryResult result = view().select(anyAttribute(userClass())) //
				.from(userClass()) //
				.join(roleClass(), over(userGroupDomain())) //
				.where(condition(attribute(roleClass(), roleClass().getKeyAttributeName()), eq(groupId))) //
				.run();

		final List<CMUser> usersForSpecifiedGroup = Lists.newArrayList();
		for (final CMQueryRow row : result) {
			final CMCard userCard = row.getCard(userClass());
			final CMUser user = buildUserFromCard(userCard);
			usersForSpecifiedGroup.add(user);
		}
		return usersForSpecifiedGroup;

	}

	@Override
	public List<Long> fetchUserIdsFromGroupId(final Long groupId) {
		final CMQueryResult result = view().select(anyAttribute(userClass())) //
				.from(userClass()) //
				.join(roleClass(), over(userGroupDomain())) //
				.where(condition(attribute(roleClass(), roleClass().getKeyAttributeName()), eq(groupId))) //
				.run();

		final List<Long> userIdsForSpecifiedGroup = Lists.newArrayList();
		for (final CMQueryRow row : result) {
			final CMCard userCard = row.getCard(userClass());
			userIdsForSpecifiedGroup.add(userCard.getId());
		}
		return userIdsForSpecifiedGroup;

	}

	private CMUser buildUserFromCard(final CMCard _userCard) {
		final CMCard userCard = NullOnErrorOfGetCard.of(_userCard);
		final Long userId = userCard.getId();
		final String username = userCard.get(userNameAttribute(), String.class);
		final String email = userCard.get(userEmailAttribute(), String.class);
		final String userDescription = userCard.get(userDescriptionAttribute(), String.class);
		final String defaultGroupName = fetchDefaultGroupNameForUser(username);
		final LocalDateTime passwordExpirationTimestamp = fetchPasswordExpirationTimestamp(userCard);
		final UserImplBuilder userBuilder = UserImpl.newInstanceBuilder() //
				.withId(userId) //
				.withUsername(defaultString(username)) //
				.withEmail(defaultString(email)) //
				.withDescription(defaultString(userDescription)) //
				.withDefaultGroupName(defaultGroupName) //
				.withActiveStatus(extendedInformation() ? userCard.get(ACTIVE, Boolean.class) : null) //
				.withServiceStatus(extendedInformation() ? userCard.get(SERVICE, Boolean.class) : null) //
				.withPrivilegedStatus(extendedInformation() ? userCard.get(PRIVILEGED, Boolean.class) : null) //
				.withpasswordExpirationTimestamp(passwordExpirationTimestamp) //
				.withLastPasswordChange(fetchTimestamp(userCard, userLastPasswordChangeTimestampAttribute())) //
				.withLastExpiringNotification(fetchTimestamp(userCard, userLastExpiringNotification()));

		final List<String> userGroups = fetchGroupNamesForUser(userId);
		for (final String groupName : userGroups) {
			userBuilder.withGroupName(groupName);
			addGroupDescription(userBuilder, groupName);
		}
		return userBuilder.build();
	}

	@Deprecated //favour general method
	private LocalDateTime fetchPasswordExpirationTimestamp(CMCard userCard) {
		org.joda.time.DateTime pe = userCard.get(userPasswordExpirationTimestampAttribute(), org.joda.time.DateTime.class , null);
		if (pe == null)
			return null;
		return LocalDateTime.of(pe.getYear(), pe.getMonthOfYear(), pe.getDayOfMonth(), pe.getHourOfDay(), pe.getMinuteOfHour());
	}
	
	private LocalDateTime fetchTimestamp(CMCard userCard, String attribute) {
		org.joda.time.DateTime pe = userCard.get(attribute, org.joda.time.DateTime.class , null);
		if (pe == null)
			return null;
		return LocalDateTime.of(pe.getYear(), pe.getMonthOfYear(), pe.getDayOfMonth(), pe.getHourOfDay(), pe.getMinuteOfHour(), pe.getSecondOfMinute(), pe.getMillisOfSecond());
	}
	
	

	protected abstract boolean extendedInformation();

	/**
	 * .
	 *
	 * @param userBuilder
	 * @param groupName
	 */
	private void addGroupDescription( //
			final UserImplBuilder userBuilder, //
			final String groupName //
	) {
		try {
			final CMCard roleCard = view().select(anyAttribute(roleClass())) //
					.from(roleClass()) //
					.where(condition(attribute(roleClass(), ROLE_NAME_COLUMN), eq(groupName))) //
					.limit(1) //
					.skipDefaultOrdering() //
					.run() //
					.getOnlyRow() //
					.getCard(roleClass());

			final Object roleDescription = roleCard.getDescription();
			if (roleDescription != null) {
				userBuilder.withGroupDescription(roleDescription.toString());
			}
		} catch (final Exception e) {
			logger.debug("Error reading description of group " + groupName);
		}
	}

	private String fetchDefaultGroupNameForUser(final String username) {
		String defaultGroupName = null;
		if (allowsDefaultGroup()) {
			final CMQueryResult result = view()
					.select(attribute(userClass(), userNameAttribute()),
							attribute(userGroupDomain(), UserRole.DEFAULT_GROUP),
							attribute(roleClass(), roleClass().getCodeAttributeName())) //
					.from(userClass()) //
					.join(roleClass(), over(userGroupDomain())) //
					.where(condition(attribute(userClass(), userNameAttribute()), //
							eq(username))) //
					.run();

			for (final CMQueryRow row : result) {
				final CMCard group = row.getCard(roleClass());
				final CMRelation relation = row.getRelation(userGroupDomain()).getRelation();
				final String groupName = (String) group.getCode();
				final Object isDefaultGroup = relation.get(UserRole.DEFAULT_GROUP);
				if (isDefaultGroup != null) {
					if ((Boolean) isDefaultGroup) {
						defaultGroupName = groupName;
					}
				}
			}
		}
		return defaultGroupName;
	}

	protected boolean allowsDefaultGroup() {
		return true;
	}

	protected CMCard fetchUserCard(final Login login) throws NoSuchElementException {
		final Alias userClassAlias = EntryTypeAlias.canonicalAlias(userClass());
		final CMQueryResult queryResult = view().select(anyAttribute(userClass())) //
				.from(userClass(), as(userClassAlias)) //
				.where(and( //
						activeCondition(userClassAlias), //
						condition(attribute(userClassAlias, loginAttributeName(login)), //
								configuration().isCaseInsensitive() ? equalsIgnoreCase(login.getValue())
										: eq(login.getValue())))) //
				.limit(1) //
				.skipDefaultOrdering() //
				.run();
		final CMCard userCard;
		if (queryResult.size() == 1) {
			userCard = queryResult.getOnlyRow().getCard(userClassAlias);
		} else {
			userCard = null;
		}
		return userCard;
	}

	protected WhereClause activeCondition(final Alias userClassAlias) {
		return condition(attribute(userClassAlias, ACTIVE), eq(true));
	}

	private List<String> fetchGroupNamesForUser(final Long userId) {
		final List<String> groupNames = new ArrayList<String>();
		final Alias groupClassAlias = EntryTypeAlias.canonicalAlias(roleClass());
		final Alias userClassAlias = EntryTypeAlias.canonicalAlias(userClass());
		final CMQueryResult userGroupsRows = view().select(attribute(groupClassAlias, Role.CODE)) //
				.from(roleClass()) //
				.join(userClass(), as(userClassAlias), over(userGroupDomain())) //
				.where(and( //
						condition(attribute(roleClass(), Role.ACTIVE), //
								eq(true)), //
						condition(attribute(userClass(), userIdAttribute()), //
								eq(userId)))) //
				.run();
		for (final CMQueryRow row : userGroupsRows) {
			final CMCard groupCard = row.getCard(groupClassAlias);
			groupNames.add((String) groupCard.getCode());
		}
		return groupNames;
	}

	@Override
	public PagedElements<CMUser> fetchAllUsers(final int offset, final int limit, final Map<String, Boolean> sort,
			final Iterable<Long> exclude, final String query, final boolean activeOnly) {
		final Alias USER = canonical(userClass());
		final CMQueryResult result = view().select(anyAttribute(USER)) //
				.from(userClass(), as(USER)) //
				.where(and( //
						exclude(USER, userClass().getKeyAttributeName(), requireNonNull(exclude)), //
						query(USER, asList(USERNAME, DESCRIPTION), query), //
						activeOnly ? activeCondition(USER) : alwaysTrue()) //
		) //
				.orderBy(safe(sort).entrySet() //
						.stream() //
						.collect(toMap(input -> attribute(USER, input.getKey()),
								input -> input.getValue() ? ASC : DESC))) //
				.offset(offset) //
				.limit(limit) //
				.count() //
				.run();
		final Iterable<CMUser> users = from(result) //
				.transform(toCard(USER)) //
				.transform(input -> buildUserFromCard(input));
		return new PagedElements<>(users, result.totalSize());
	}

	private static <T> WhereClause exclude(final Alias alias, final String name, final Iterable<T> values) {
		final Iterable<T> _values = defaultIfNull(values, emptyList());
		return isEmpty(_values) ? alwaysTrue()
				: not(condition(attribute(alias, name), in(toArray(_values, Object.class))));
	}

	private static WhereClause query(final Alias alias, final Iterable<String> names, final String query) {
		return isBlank(query) || isEmpty(names) ? alwaysTrue() : or(from(names) //
				.transform(input -> condition(attribute(alias, input), contains(query))));
	}

	private Map<String, Boolean> safe(final Map<String, Boolean> sort) {
		final Map<String, Boolean> output;
		if (sort == null) {
			output = new LinkedHashMap<>();
		} else {
			output = new LinkedHashMap<>(sort);
		}
		if (output.isEmpty()) {
			output.put(userNameAttribute(), true);
		}
		return output;
	}

	@Override
	public Iterable<CMUser> fetchServiceOrPrivilegedUsers() {
		final CMClass target = userClass();
		final CMQueryResult result = view().select(anyAttribute(target)) //
				.from(target) //
				.where(or( //
						condition(attribute(target, SERVICE), eq(true)), //
						condition(attribute(target, PRIVILEGED), eq(true))) //
		) //
				.run();
		final List<CMUser> allUsers = Lists.newArrayList();
		for (final CMQueryRow row : result) {
			final CMCard userCard = row.getCard(target);
			final CMUser user = buildUserFromCard(userCard);
			allUsers.add(user);
		}
		return allUsers;
	}

	/*
	 * Methods to shade class and attribute names. They should be detected by
	 * metadatas, but for now we stick to what the DBA has decided.
	 */

	protected abstract CMClass userClass();

	protected abstract CMClass roleClass();

	protected abstract String userEmailAttribute();

	protected abstract String userNameAttribute();

	protected abstract String userDescriptionAttribute();

	protected abstract String userPasswordAttribute();

	protected abstract String userIdAttribute();

	protected abstract CMDomain userGroupDomain();

	protected String loginAttributeName(final Login login) {
		switch (login.getType()) {
		case USERNAME:
			return userNameAttribute();
		case EMAIL:
			return userEmailAttribute();
		default:
			throw new IllegalArgumentException("Unsupported login type");
		}
	}
	
	protected abstract String userPasswordExpirationTimestampAttribute();
	protected abstract String userLastPasswordChangeTimestampAttribute();
	protected abstract String userLastExpiringNotification();

}
