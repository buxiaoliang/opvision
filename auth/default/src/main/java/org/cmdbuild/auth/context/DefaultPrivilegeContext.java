package org.cmdbuild.auth.context;

import com.google.common.base.Joiner;
import static com.google.common.base.MoreObjects.firstNonNull;
import static com.google.common.base.Objects.equal;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Predicates.notNull;
import com.google.common.base.Splitter;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Iterables;
import static com.google.common.collect.Iterables.filter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.auth.acl.CMPrivilege;
import org.cmdbuild.auth.acl.CMPrivilegedObject;
import org.cmdbuild.auth.acl.DefaultPrivileges;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.auth.acl.PrivilegePair;
import org.cmdbuild.auth.privileges.constants.PrivilegedObjectType;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;

import com.google.common.collect.Lists;
import static com.google.common.collect.Lists.transform;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Sets;
import static java.util.Arrays.asList;
import java.util.Collection;
import java.util.Collections;
import static java.util.Collections.singletonList;
import java.util.LinkedHashMap;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.Builder;
import static org.cmdbuild.auth.acl.DefaultPrivileges.GLOBAL_PRIVILEGE_ID;
import static org.cmdbuild.auth.acl.DefaultPrivileges.privilegeToString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Default implementation of privilege context<br>
 * note: current implementation has a <i>legacy</i> implementation, which
 * guarantees backward compatibility, and a
 * <i>new</i> implementation, which handles new use cases, such as multigroup
 * permissions with filters and stuff.<br>
 * Eventually legacy implementation will have to be removed.
 * <br>
 * <br>
 * This class must be initialized with the included builder
 * {@link DefaultPrivilegeContext.DefaultPrivilegeContextBuilder}, like
 * this:<br>
 * <pre>
 * {@code
 * DefaultPrivilegeContextBuilder privilegeCtxBuilder = DefaultPrivilegeContext.newBuilderInstance();
 * for (CMGroup group : someInput) {
 * List<PrivilegePair> privileges = group.getAllPrivileges();
 * privilegeCtxBuilder.withPrivileges(privileges);
 * }
 * PrivilegeContext privilegeContext = privilegeCtxBuilder.build();
 * }
 * </pre>
 *
 * @author davide
 */
public class DefaultPrivilegeContext implements PrivilegeContext {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private final Map<String, PrivilegesContainer> legacyObjectPrivilegesMap;
	private final Multimap<String, PrivilegesContainer> newObjectPrivilegesMap;

	private DefaultPrivilegeContext(Map<String, PrivilegesContainer> legacyObjectPrivilegesMap, Multimap<String, PrivilegesContainer> newObjectPrivilegesMap) {
		checkNotNull(legacyObjectPrivilegesMap);
		checkNotNull(newObjectPrivilegesMap);
		this.legacyObjectPrivilegesMap = ImmutableMap.copyOf(legacyObjectPrivilegesMap);
		this.newObjectPrivilegesMap = ImmutableMultimap.copyOf(newObjectPrivilegesMap);
	}

	public static DefaultPrivilegeContextBuilder newBuilderInstance() {
		return new DefaultPrivilegeContextBuilder();
	}

	//BEGIN FIXME move this methods to utility class
	public static String splitJoin(int maxSize, String prefix, String text) {
		return Joiner.on(prefix).join(Splitter.fixedLength(maxSize).split(text));
	}

	public static String splitJoin(int offset, String text) {
		return splitJoin(120 - offset, "\n" + StringUtils.rightPad("", offset), text); //TODO use sistem property for width
	}
	//END

	public String getPrivilegeContextAsHumanReadableDescription() {
		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.append("\n  legacyObjectPrivilegesMap\n");
		for (Map.Entry<String, PrivilegesContainer> entry : new TreeMap<>(legacyObjectPrivilegesMap).entrySet()) {
			stringBuilder.append("    ").append(entry.getKey()).append("\n");
			stringBuilder.append("      privilegesGroupId = ").append(entry.getValue().getPrivilegesGroupId()).append("\n");
			stringBuilder.append("      objectPrivileges  = ").append(Joiner.on(",").join(transform(entry.getValue().getObjectPrivileges(), p -> privilegeToString(p)))).append("\n");
			stringBuilder.append("      attributes        = ").append(splitJoin(27, Joiner.on(",").join(entry.getValue().getPrivilegedObjectMetadata().getAttributesPrivileges()))).append("\n");
			stringBuilder.append("      filters           = ").append(Joiner.on(",").join(entry.getValue().getPrivilegedObjectMetadata().getFilters())).append("\n");
		}
		stringBuilder.append("\n  newObjectPrivilegesMap\n");
		for (Map.Entry<String, Collection<PrivilegesContainer>> entry : new TreeMap<>(newObjectPrivilegesMap.asMap()).entrySet()) {
			stringBuilder.append("    ").append(entry.getKey()).append("\n");
			for (PrivilegesContainer privilegesContainer : entry.getValue()) {
				stringBuilder.append("     -\n");
				stringBuilder.append("      privilegesGroupId  = ").append(privilegesContainer.getPrivilegesGroupId()).append("\n");
				stringBuilder.append("      objectPrivileges   = ").append(Joiner.on(",").join(transform(privilegesContainer.getObjectPrivileges(), p -> privilegeToString(p)))).append("\n");
				stringBuilder.append("      attributes         = ").append(splitJoin(27, Joiner.on(",").join(privilegesContainer.getPrivilegedObjectMetadata().getAttributesPrivileges()))).append("\n");
				stringBuilder.append("      filters            = ").append(Joiner.on(",").join(privilegesContainer.getPrivilegedObjectMetadata().getFilters())).append("\n");
			}
		}
		return stringBuilder.toString();
	}

	@Override
	public boolean hasAdministratorPrivileges() {
		return hasPrivilege(DefaultPrivileges.ADMINISTRATOR);
	}

	@Override
	public boolean hasDatabaseDesignerPrivileges() {
		return hasPrivilege(DefaultPrivileges.DATABASE_DESIGNER);
	}

	@Override
	public boolean hasPrivilege(final CMPrivilege privilege) {
		return hasPrivilege(privilege, GLOBAL_PRIVILEGE_ID);
	}

	@Override
	public boolean hasReadAccess(final CMPrivilegedObject privilegedObject) {
		if (privilegedObject instanceof CMDomain) {
			final CMDomain domain = (CMDomain) privilegedObject;
			return domainHasPrivilege(domain, DefaultPrivileges.READ);
		}
		return hasPrivilege(DefaultPrivileges.READ, privilegedObject);
	}

	@Override
	public boolean hasWriteAccess(final CMPrivilegedObject privilegedObject) {
		if (privilegedObject instanceof CMDomain) {
			final CMDomain domain = (CMDomain) privilegedObject;
			return domainHasPrivilege(domain, DefaultPrivileges.WRITE);
		}
		return hasPrivilege(DefaultPrivileges.WRITE, privilegedObject);
	}

	private boolean domainHasPrivilege(final CMDomain domain, final CMPrivilege privilege) {
		final CMClass class1 = domain.getClass1();
		final CMClass class2 = domain.getClass2();
		return hasPrivilege(privilege, class1) //
				&& hasPrivilege(privilege, class2);
	}

	@Override
	public boolean hasPrivilege(final CMPrivilege requested, final CMPrivilegedObject privilegedObject) {
		return hasPrivilege(requested, GLOBAL_PRIVILEGE_ID)
				|| hasPrivilege(requested, privilegedObject.getPrivilegeId());
	}

	private boolean hasPrivilege(final CMPrivilege requested, final String privilegeId) {
		for (final CMPrivilege granted : getPrivilegesFor(privilegeId)) {
			if (granted.implies(requested)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns the privileges for an object. Used by tests.
	 *
	 * @param object
	 * @return
	 */
	public List<CMPrivilege> getPrivilegesFor(final CMPrivilegedObject object) {
		return getPrivilegesFor(object.getPrivilegeId());
	}

	public List<CMPrivilege> getPrivilegesFor(String privilegeId) {
		PrivilegesContainer objectPrivilegesContainer = legacyObjectPrivilegesMap.get(privilegeId);
		return objectPrivilegesContainer == null ? Collections.emptyList() : objectPrivilegesContainer.getObjectPrivileges();
	}

	/**
	 * Note: must be used only by tests
	 *
	 * @return
	 */
	public List<PrivilegePair> getAllPrivileges() {
		final List<PrivilegePair> allPrivileges = new ArrayList<>();
		for (final Map.Entry<String, List<CMPrivilege>> entry : Maps.transformValues(legacyObjectPrivilegesMap, (PrivilegesContainer o) -> {
			return o.getObjectPrivileges();
		}).entrySet()) {
			for (final CMPrivilege priv : entry.getValue()) {
				final PrivilegePair privPair = new PrivilegePair(entry.getKey(), priv);
				allPrivileges.add(privPair);
			}
		}
		return allPrivileges;
	}

	@Override
	public PrivilegedObjectMetadata getMetadata(final CMPrivilegedObject privilegedObject) {
		final String privilegeId = privilegedObject.getPrivilegeId();
		PrivilegesContainer objectPrivilegesContainer = legacyObjectPrivilegesMap.get(privilegeId);
		return objectPrivilegesContainer == null ? new DefaultPrivilegedObjectMetadata(Collections.emptyList(), Collections.emptyList()) : objectPrivilegesContainer.getPrivilegedObjectMetadata();
	}

	@Override
	public Iterable<PrivilegesContainer> getAllPrivilegesContainers(CMPrivilegedObject privilegedObject) {
		final String privilegeId = privilegedObject.getPrivilegeId();
		return newObjectPrivilegesMap.get(privilegeId);
	}

//	@Override
//	public Iterable<PrivilegeContext> getPrivilegeContextList(final CMPrivilegedObject privilegedObject) {
//		return ImmutableList.copyOf(Iterables.transform(getAllPrivilegesContainers(privilegedObject),
//				(PrivilegesContainer c) -> newBuilderInstance().withPrivilegesContainers(privilegedObject.getPrivilegeId(), Arrays.asList(c)).build()));
//	}
	@Override
	public List<PrivilegeContext> getPrivilegeContextList() {
		logger.debug("getPrivilegeContextList");
		if (logger.isDebugEnabled()) {
			logger.debug("original privilegeContext = \n{}", this.getPrivilegeContextAsHumanReadableDescription());
		}
		return ImmutableList.copyOf(Iterables.transform(
				Multimaps.index(newObjectPrivilegesMap.entries(), c -> c.getValue().getPrivilegesGroupId()).asMap().entrySet(),
				c -> {
					DefaultPrivilegeContextBuilder builder = newBuilderInstance();
					for (Map.Entry<String, PrivilegesContainer> e : c.getValue()) {
						builder.withPrivilegesContainers(c.getKey(), e.getKey(), singletonList(e.getValue()));
					}
					return builder.build();
				}
		));
	}

	public static class DefaultPrivilegeContextBuilder implements Builder<DefaultPrivilegeContext> {

		private final Logger logger = LoggerFactory.getLogger(getClass());

		private final Map<String, List<CMPrivilege>> objectPrivileges;
		private final Map<String, List<String>> privilegeFilters;
		private final Map<String, List<String>> disabledAttributes;
		private final Multimap<String, PrivilegesContainer> newObjectPrivilegesMap = HashMultimap.create();

		private DefaultPrivilegeContextBuilder() {
			objectPrivileges = new LinkedHashMap<>();
			privilegeFilters = new LinkedHashMap<>();
			disabledAttributes = new LinkedHashMap<>();
		}

		/**
		 * @param privilege
		 * @param object
		 * @deprecated use withPrivileges instead in order to store also
		 * privileges for rows and columns
		 */
		@Deprecated
		public void withPrivilege(final CMPrivilege privilege, final CMPrivilegedObject object) {
			Validate.notNull(object);
			Validate.notNull(privilege);
			addPrivilege(privilege, object.getPrivilegeId());
		}

		/**
		 * @param privilege
		 * @deprecated use withPrivileges instead in order to store also
		 * privileges for rows and columns
		 */
		@Deprecated
		public void withPrivilege(final CMPrivilege privilege) {
			Validate.notNull(privilege);
			addPrivilege(privilege, GLOBAL_PRIVILEGE_ID);
		}

		public DefaultPrivilegeContextBuilder withPrivilegesContainers(@Nullable String privilegesGroupId, String name, Iterable<PrivilegesContainer> privilegesContainers) {
			Validate.notNull(privilegesContainers);
			for (PrivilegesContainer privilegesContainer : privilegesContainers) {
				PrivilegePair pair = new PrivilegePair(name, Iterables.getOnlyElement(privilegesContainer.getObjectPrivileges()));
				pair.attributesPrivileges = privilegesContainer.getPrivilegedObjectMetadata().getAttributesPrivileges().toArray(new String[]{});
				pair.privilegedObjectType = PrivilegedObjectType.CLASS.getValue(); //TODO fix this (?)
				pair.privilegeFilter = Iterables.getOnlyElement(privilegesContainer.getPrivilegedObjectMetadata().getFilters(), null);
				withPrivileges(privilegesGroupId, Arrays.asList(pair));
			}
			return this;
		}

		public void withPrivileges(final Iterable<PrivilegePair> privileges) {
			withPrivileges(null, privileges);
		}

		public void withPrivileges(@Nullable String privilegesGroupId, final Iterable<PrivilegePair> privileges) {
			Validate.notNull(privileges);
			privilegesGroupId = privilegesGroupId == null ? UUID.randomUUID().toString().substring(0, 6) : privilegesGroupId;
			for (final PrivilegePair pair : privileges) {
				String name = firstNonNull(pair.name, GLOBAL_PRIVILEGE_ID); //null means global... veeeery ugly :/
				addPrivilege(pair.privilege, name);
				if (equal(pair.privilegedObjectType, PrivilegedObjectType.CLASS.getValue())) {
					addPrivilegeFilter(name, pair.privilegeFilter);
					calculateDisabledAttributes(name, Arrays.asList(pair.attributesPrivileges));
					// new privileges framework BEGIN
					newObjectPrivilegesMap.put(name, new DefaultPrivilegesContainer(privilegesGroupId, singletonList(pair.privilege), new DefaultPrivilegedObjectMetadata(
							filter(asList(pair.privilegeFilter), notNull()),
							filter(asList(pair.attributesPrivileges), notNull())
					)));
					// new privileges framework END					
				}
			}
		}

		private List<CMPrivilege> addPrivilege(final CMPrivilege privilege, final String privilegeId) {
			final List<CMPrivilege> grantedPrivileges = getOrCreatePrivilegeList(privilegeId);
			return mergePrivilege(privilege, grantedPrivileges);
		}

		private List<CMPrivilege> getOrCreatePrivilegeList(final String privilegeId) {
			final List<CMPrivilege> grantedPrivileges;
			if (objectPrivileges.containsKey(privilegeId)) {
				grantedPrivileges = objectPrivileges.get(privilegeId);
			} else {
				grantedPrivileges = new ArrayList<>(1);
				objectPrivileges.put(privilegeId, grantedPrivileges);
			}
			return grantedPrivileges;
		}

		private List<CMPrivilege> mergePrivilege(final CMPrivilege newPrivilege, final List<CMPrivilege> grantedPrivileges) {
			final Iterator<CMPrivilege> iter = grantedPrivileges.iterator();
			while (iter.hasNext()) {
				final CMPrivilege oldPrivilege = iter.next();
				if (oldPrivilege.implies(newPrivilege)) {
					// New pivilege is implied by exising privilege
					return grantedPrivileges;
				}
				if (newPrivilege.implies(oldPrivilege)) {
					iter.remove();
				}
			}
			grantedPrivileges.add(newPrivilege);
			return grantedPrivileges;
		}

		private void addPrivilegeFilter(final String privilegeId, final String privilegeFilter) {
			List<String> currentlyStoredPrivilegeFilters;
			if (!privilegeFilters.containsKey(privilegeId)) {
				privilegeFilters.put(privilegeId, currentlyStoredPrivilegeFilters = new ArrayList<>());
			} else {
				currentlyStoredPrivilegeFilters = privilegeFilters.get(privilegeId);
			}
			currentlyStoredPrivilegeFilters.add(privilegeFilter);
		}

		private void calculateDisabledAttributes(final String privilegeId, final List<String> attributesToDisable) {
			List<String> storedDisabledAttributes;
			if (!disabledAttributes.containsKey(privilegeId)) {
				storedDisabledAttributes = new ArrayList<>();
				storedDisabledAttributes.addAll(attributesToDisable);
				disabledAttributes.put(privilegeId, storedDisabledAttributes);
			} else {
				storedDisabledAttributes = disabledAttributes.get(privilegeId);
				removeAttributesNotSatisfyingIntersectionBetween(storedDisabledAttributes, attributesToDisable);
			}
		}

		private void removeAttributesNotSatisfyingIntersectionBetween(final List<String> currentlyStoredDisabledAttributes, final List<String> attributesToDisable) {
			final List<String> attributesToRemoveFromDisabled = Lists.newArrayList();
			for (final String currentlyStoredAttribute : currentlyStoredDisabledAttributes) {
				if (!attributesToDisable.contains(currentlyStoredAttribute)) {
					attributesToRemoveFromDisabled.add(currentlyStoredAttribute);
				}
			}
			currentlyStoredDisabledAttributes.removeAll(attributesToRemoveFromDisabled);
		}

		@Override
		public DefaultPrivilegeContext build() {
			final Map<String, PrivilegedObjectMetadata> metadata = buildPrivilegedObjectMetadata();
			Map<String, PrivilegesContainer> legacyObjectPrivilegesMap = Maps.newLinkedHashMap();
			for (String key : Sets.newLinkedHashSet(Iterables.concat(metadata.keySet(), objectPrivileges.keySet()))) {
				List<CMPrivilege> thisObjectPrivileges = firstNonNull(this.objectPrivileges.get(key), Collections.emptyList());
				PrivilegedObjectMetadata privilegedObjectMetadata = firstNonNull(metadata.get(key), new DefaultPrivilegedObjectMetadata(Collections.emptyList(), Collections.emptyList()));
				legacyObjectPrivilegesMap.put(key, new DefaultPrivilegesContainer(thisObjectPrivileges, privilegedObjectMetadata));
			}
			DefaultPrivilegeContext res = new DefaultPrivilegeContext(legacyObjectPrivilegesMap, newObjectPrivilegesMap);
			logger.debug("built privilege context = {}", res);
			if (logger.isDebugEnabled()) {
				logger.debug("privilege context content = \n\n{}\n", res.getPrivilegeContextAsHumanReadableDescription());
			}
			return res;
		}

		private Map<String, PrivilegedObjectMetadata> buildPrivilegedObjectMetadata() {
			final Map<String, PrivilegedObjectMetadata> metadataMap = Maps.newHashMap();
			for (final String privilegeId : privilegeFilters.keySet()) {
				final PrivilegedObjectMetadata metadata = new DefaultPrivilegedObjectMetadata(
						privilegeFilters.get(privilegeId).stream().filter(input -> input != null).collect(Collectors.toList()),
						disabledAttributes.get(privilegeId));
				metadataMap.put(privilegeId, metadata);
			}
			return metadataMap;
		}

	}

	private static class DefaultPrivilegesContainer implements PrivilegesContainer {

		private final String privilegesGroupId;
		private final List<CMPrivilege> objectPrivileges;
		private final PrivilegedObjectMetadata privilegedObjectMetadata;

		public DefaultPrivilegesContainer(Iterable<CMPrivilege> objectPrivileges, PrivilegedObjectMetadata privilegedObjectMetadata) {
			this(null, objectPrivileges, privilegedObjectMetadata);
		}

		public DefaultPrivilegesContainer(@Nullable String privilegesGroupId, Iterable<CMPrivilege> objectPrivileges, PrivilegedObjectMetadata privilegedObjectMetadata) {
			checkNotNull(objectPrivileges);
			checkNotNull(privilegedObjectMetadata);
			this.objectPrivileges = ImmutableList.copyOf(objectPrivileges);
			this.privilegedObjectMetadata = privilegedObjectMetadata;
			this.privilegesGroupId = privilegesGroupId == null ? UUID.randomUUID().toString().substring(0, 6) : privilegesGroupId;
		}

		@Override
		public String getPrivilegesGroupId() {
			return privilegesGroupId;
		}

		@Override
		public List<CMPrivilege> getObjectPrivileges() {
			return objectPrivileges;
		}

		@Override
		public PrivilegedObjectMetadata getPrivilegedObjectMetadata() {
			return privilegedObjectMetadata;
		}

	}

	public static class DefaultPrivilegedObjectMetadata implements PrivilegedObjectMetadata {

		private final List<String> privilegeFilters;
		private final List<String> disabledAttributes;

		private DefaultPrivilegedObjectMetadata(Iterable<String> privilegeFilters, Iterable<String> disabledAttributes) {
			checkNotNull(privilegeFilters);
			checkNotNull(disabledAttributes);
			this.privilegeFilters = ImmutableList.copyOf(privilegeFilters);
			this.disabledAttributes = ImmutableList.copyOf(disabledAttributes);
		}

		@Override
		public List<String> getFilters() {
			return privilegeFilters;
		}

		@Override
		public List<String> getAttributesPrivileges() {
			return disabledAttributes;
		}

		@Override
		public String toString() {
			return "DefaultPrivilegedObjectMetadata{" + "privilegeFilters=" + privilegeFilters + ", disabledAttributes=" + disabledAttributes + '}';
		}

	}
}
