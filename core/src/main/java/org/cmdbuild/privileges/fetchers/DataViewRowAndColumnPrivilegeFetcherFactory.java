package org.cmdbuild.privileges.fetchers;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Predicates.isNull;
import static com.google.common.base.Predicates.not;
import static com.google.common.base.Predicates.notNull;
import com.google.common.collect.Iterables;
import static com.google.common.collect.Iterables.isEmpty;
import static java.util.Collections.emptyList;
import static org.cmdbuild.dao.query.clause.alias.Aliases.canonical;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.auth.acl.PrivilegeContext.PrivilegedObjectMetadata;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcher;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcherFactory;
import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.mapping.json.JsonFilterMapper;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import java.util.Collections;
import javax.annotation.Nullable;
import static org.apache.commons.lang3.StringUtils.trim;
import org.cmdbuild.auth.acl.PrivilegeContext.PrivilegesContainer;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMAttribute.Mode;
import org.cmdbuild.dao.entrytype.CMClass;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.where.AndWhereClause.and;
import static org.cmdbuild.dao.query.clause.where.OperatorAndValues.eq;
import static org.cmdbuild.dao.query.clause.where.OrWhereClause.or;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.condition;
import org.cmdbuild.dao.view.user.UserDataView;
import static org.cmdbuild.report.ReportFactoryTemplateDetailSubreport.BEGIN_DATE;
import org.slf4j.LoggerFactory;

public class DataViewRowAndColumnPrivilegeFetcherFactory implements RowAndColumnPrivilegeFetcherFactory {

	private static class RowAndColumnPrivilegeFetcherImpl implements RowAndColumnPrivilegeFetcher {

		@Deprecated
		private static final Logger legacyLogger = Log.PERSISTENCE;
		private final Logger logger = LoggerFactory.getLogger(getClass());

		private static final List<WhereClause> EMPTY_WHERE_CLAUSES = emptyList();

		private final CMDataView dataView;
		private final PrivilegeContext privilegeContext;
		private final UserStore userStore;

		private RowAndColumnPrivilegeFetcherImpl(final CMDataView dataView, final PrivilegeContext privilegeContext,
				final UserStore userStore) {
			this.dataView = dataView;
			this.privilegeContext = privilegeContext;
			this.userStore = userStore;
		}

		/**
		 * FIXME: consider also filter on relations... bug on privileges on rows
		 * when relations are specified
		 */
		@Override
		public Iterable<WhereClause> fetchPrivilegeFiltersFor(final CMEntryType entryType) {
			return fetchPrivilegeFiltersFor(entryType, canonical(entryType));
		}

		@Override
		public Iterable<WhereClause> fetchPrivilegeFiltersFor(final CMEntryType entryType, final Alias alias) {
			logger.debug("fetchPrivilegeFiltersFor entryType = {}, alias = {}", entryType, alias);
			if (privilegeContext.hasAdministratorPrivileges() && entryType.isActive()) {
				return EMPTY_WHERE_CLAUSES;
			}
			Iterable<PrivilegeContext.PrivilegesContainer> privilegesContainers = privilegeContext.getAllPrivilegesContainers(entryType);
			if (Iterables.isEmpty(privilegesContainers)) {
				return EMPTY_WHERE_CLAUSES;
			}
			final List<WhereClause> whereClauseFilters = Lists.newArrayList();
			for (PrivilegesContainer privilegesContainer : privilegesContainers) {
				if (Iterables.any(privilegesContainer.getPrivilegedObjectMetadata().getFilters(), not(isNull()))) { //TODO replace predicate with 'isNullOrEmpty' !!
					for (String privilegeFilter : privilegesContainer.getPrivilegedObjectMetadata().getFilters()) {
						try {
							final Iterable<WhereClause> whereClauses = createWhereClausesFrom(privilegeFilter, entryType, alias);
							logger.debug("built where clauses = {} for privilegeFilter = {}", whereClauses, privilegeFilter);
							if (!isEmpty(whereClauses)) {
								whereClauseFilters.add(and(whereClauses));
							}
						} catch (final JSONException e) {
							legacyLogger.warn("error creating where clause", e);
							logger.warn("error creating where clause", e);
//							return FalseWhereClause.falseWhereClause(); //safe fallback, show nothing... maybe is better to throw an error?
						}
					}
				} else {
					return EMPTY_WHERE_CLAUSES;
				}
			}
			return Collections.singletonList(or(whereClauseFilters));
		}

		private Iterable<WhereClause> createWhereClausesFrom(final String privilegeFilter, final CMEntryType entryType,
				final Alias entryTypeAlias) throws JSONException {
			final JSONObject jsonPrivilegeFilter = new JSONObject(privilegeFilter);
			return JsonFilterMapper.newInstance() //
					.withDataView(dataView) //
					.withEntryType(entryType) //
					.withEntryTypeAlias(entryTypeAlias) //
					.withFilterObject(jsonPrivilegeFilter) //
					.withOperationUser(userStore.getUser()) //
					.build() //
					.whereClauses();
		}

		/**
		 * If superUser return write privilege for all the attributes
		 *
		 * If not superUser, looking for some attributes privilege definition,
		 * if there is no one return the attributes mode defined globally
		 */
		@Override
		public Map<String, String> fetchAttributesPrivilegesFor(final CMEntryType entryType) {
			logger.debug("fetchAttributesPrivilegesFor entryType = {}", localName(entryType));

			final Map<String, String> groupLevelAttributePrivileges = getAttributePrivilegesMap(entryType);

			// initialize a map with the
			// mode set for attribute globally
			final Map<String, String> mergedAttributesPrivileges = Maps.newLinkedHashMap();
			final Iterable<? extends CMAttribute> attributes = entryType.getAllAttributes();
			for (final CMAttribute attribute : attributes) {
				if (attribute.isActive()) {
					final String mode = attribute.getMode().name().toLowerCase();
					mergedAttributesPrivileges.put(attribute.getName(), mode);
				}
			}

			/*
			 * The super user has no added limitation for the attributes, so
			 * return the global attributes modes
			 */
			if (privilegeContext.hasAdministratorPrivileges()) {
				return mergedAttributesPrivileges;
			}

			// merge with the privileges set at group level
			for (final String attributeName : groupLevelAttributePrivileges.keySet()) {
				if (mergedAttributesPrivileges.containsKey(attributeName)) {
					mergedAttributesPrivileges.put( //
							attributeName, //
							groupLevelAttributePrivileges.get(attributeName) //
					);
				}
			}

			logger.debug("fetchAttributesPrivilegesFor res = {}", mergedAttributesPrivileges);
			return mergedAttributesPrivileges;
		}

		private Map<String, String> getAttributePrivilegesMap(final CMEntryType entryType) {
			final PrivilegedObjectMetadata metadata = privilegeContext.getMetadata(entryType);
			final Map<String, String> attributePrivileges = new HashMap<>();
			if (metadata != null) {
				for (final String privilege : metadata.getAttributesPrivileges()) {
					final String[] parts = privilege.split(":");
					attributePrivileges.put(parts[0], parts[1]);
				}
			}

			return attributePrivileges;
		}

		//FIXME move this to dedicated 'utils' class, or remove this by refactoring code
		public static Object localName(CMEntryType entryType) {
			return new Object() {
				@Override
				public String toString() {
					return entryType == null ? null : entryType.getIdentifier().getLocalName();
				}

			};
		}

		@Override
		public Map<String, String> fetchAttributesPrivilegesFor(CMEntryType entryType, @Nullable CMCard card) {
			logger.debug("fetchAttributesPrivilegesFor entryType = {} card = {}", localName(entryType), card);

			//BEGIN code for attribute fetching by card (currently disabled because a) interface does not use it and b) performance hit is not irrelevant
//			if (card == null) {
//				return fetchAttributesPrivilegesFor(entryType);
//			} else {				
//				List<PrivilegeContext> privilegeContexts = privilegeContext.getPrivilegeContextList();
//				logger.debug("privilegeContexts = {}", privilegeContexts);
//				OperationUser operationUser = userStore.getUser();
//				List<Map<String, String>> toMerge = Lists.newArrayList();
//				for (PrivilegeContext thisPrivilegeContext : Iterables.filter(privilegeContexts, c -> c.hasReadAccess(entryType))) {
//					logger.debug("processing thisPrivilegeContext = {}", thisPrivilegeContext);
//					CMDataView thisDataView;
//					if (dataView instanceof UserDataView) { //  UserDataView implements thisDataView.use(thisPrivilegeContext); not all data views did
//						thisDataView = dataView;
//					} else {
//						thisDataView = new UserDataView(dataView, new DataViewRowAndColumnPrivilegeFetcherFactory(dataView, userStore), new OperationUser(operationUser, thisPrivilegeContext));
//					}
//					boolean thisPrivilegeContextCanSeeThisCard = thisDataView.use(thisPrivilegeContext)
//							.select(((CMClass) entryType).isSimple() ? attribute(entryType, BEGIN_DATE) : attribute(entryType, ((CMClass) entryType).getDescriptionAttributeName())) //
//							.from(((CMClass) entryType)) //
//							.where(condition(attribute(entryType, org.cmdbuild.dao.driver.postgres.Const.ID_ATTRIBUTE), eq(card.getId()))) //
//							.limit(1) //
//							.skipDefaultOrdering() //
//							.run() //
//							.iterator() //
//							.hasNext();
//					if (thisPrivilegeContextCanSeeThisCard) {
//						logger.debug("thisPrivilegeContextCanSeeThisCard = true, processing attribute privileges");
//						toMerge.add(new DataViewRowAndColumnPrivilegeFetcherFactory(dataView, userStore).create(thisPrivilegeContext).fetchAttributesPrivilegesFor(entryType));
//					} else {
//						logger.debug("thisPrivilegeContextCanSeeThisCard = false, skipping");
//					}
//				}
//				checkArgument(!toMerge.isEmpty(), "this cannot be empty! calling fetchAttributesPrivilegesFor with entryType/privileges/card that doesn't allow the user to see this card at all");
//				Map<String, String> res = mergeAttributes(toMerge);
//				logger.debug("fetchAttributesPrivilegesFor processed attributes = {}", res);
//				return res;
//			}
//END code for attribute by card
			
			//BEGIN fallbakc method, ignore card
			return fetchAttributesPrivilegesFor(entryType);
			//END fallback method

		}

		private Map<String, String> mergeAttributes(List<Map<String, String>> toMerge) {
			Map<String, String> res = Maps.newLinkedHashMap();
			for (String key : Sets.newLinkedHashSet(Iterables.concat(Iterables.transform(toMerge, (Map<String, String> m) -> m.keySet())))) {
				res.put(key, mergetAttributeModeValues(Iterables.filter(Iterables.transform(toMerge, (Map<String, String> m) -> m.get(key)), notNull())));
			}
			return res;
		}

		/**
		 * merge attribute values, using 'Mode' framework;
		 *
		 * @param values, non-empty, non-null list of values
		 * @return a single valid attribute mode
		 */
		private String mergetAttributeModeValues(Iterable<String> values) {
			checkNotNull(values);
			checkArgument(!Iterables.isEmpty(values));
			Mode mode = Mode.HIDDEN; //safe default
			for (String thisValue : values) {
				Mode thisMode = Mode.valueOf(trim(thisValue).toUpperCase());
				mode = mode.implies(thisMode) ? mode : thisMode;
			}
			return mode.name();
		}

	}

	private final CMDataView dataView;
	private final UserStore userStore;

	public DataViewRowAndColumnPrivilegeFetcherFactory(final CMDataView dataView, final UserStore userStore) {
		this.dataView = dataView;
		this.userStore = userStore;
	}

	@Override
	public RowAndColumnPrivilegeFetcher create(final PrivilegeContext privilegeContext) {
		return new RowAndColumnPrivilegeFetcherImpl(dataView, privilegeContext, userStore);
	}

}
