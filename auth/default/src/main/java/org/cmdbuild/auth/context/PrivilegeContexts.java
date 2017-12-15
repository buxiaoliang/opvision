package org.cmdbuild.auth.context;

import java.util.List;

import org.cmdbuild.auth.acl.CMPrivilege;
import org.cmdbuild.auth.acl.CMPrivilegedObject;
import org.cmdbuild.auth.acl.PrivilegeContext;

import com.google.common.collect.Lists;
import java.util.Collections;

public class PrivilegeContexts {

	/**
	 * Implementation of null object pattern. The user with this
	 * PrivilegeContext could not perform any operation because it does not have
	 * any privilege
	 */
	public static class NullPrivilegeContext implements PrivilegeContext {

		/**
		 * Use factory method.
		 */
		private NullPrivilegeContext() {
		}

		@Override
		public boolean hasPrivilege(final CMPrivilege privilege) {
			return false;
		}

		@Override
		public boolean hasAdministratorPrivileges() {
			return false;
		}

		@Override
		public boolean hasDatabaseDesignerPrivileges() {
			return false;
		}

		@Override
		public boolean hasPrivilege(final CMPrivilege requested, final CMPrivilegedObject privilegedObject) {
			return false;
		}

		@Override
		public boolean hasReadAccess(final CMPrivilegedObject privilegedObject) {
			return false;
		}

		@Override
		public boolean hasWriteAccess(final CMPrivilegedObject privilegedObject) {
			return false;
		}

		@Override
		public PrivilegedObjectMetadata getMetadata(final CMPrivilegedObject privilegedObject) {
			return null;
		}

		@Override
		public List<PrivilegesContainer> getAllPrivilegesContainers(CMPrivilegedObject privilegedObject) {
			return Collections.emptyList();
		}

		@Override
		public List<PrivilegeContext> getPrivilegeContextList() {
			return Collections.emptyList();
		}

	}

	private static final PrivilegeContext NULL_PRIVILEGE_CONTEXT = new NullPrivilegeContext();

	public static final PrivilegeContext nullPrivilegeContext() {
		return NULL_PRIVILEGE_CONTEXT;
	}

	public static class SystemPrivilegeContext implements PrivilegeContext {

		/**
		 * Use factory method.
		 */
		private SystemPrivilegeContext() {
		}

		@Override
		public boolean hasPrivilege(final CMPrivilege privilege) {
			return true;
		}

		@Override
		public boolean hasAdministratorPrivileges() {
			return true;
		}

		@Override
		public boolean hasDatabaseDesignerPrivileges() {
			return true;
		}

		@Override
		public boolean hasPrivilege(final CMPrivilege requested, final CMPrivilegedObject privilegedObject) {
			return true;
		}

		@Override
		public boolean hasReadAccess(final CMPrivilegedObject privilegedObject) {
			return true;
		}

		@Override
		public boolean hasWriteAccess(final CMPrivilegedObject privilegedObject) {
			return true;
		}

		@Override
		public PrivilegedObjectMetadata getMetadata(final CMPrivilegedObject privilegedObject) {
			return new PrivilegedObjectMetadata() {

				@Override
				public List<String> getFilters() {
					return Lists.newArrayList();
				}

				@Override
				public List<String> getAttributesPrivileges() {
					return Lists.newArrayList();
				}
			};
		}

		@Override
		public List<PrivilegesContainer> getAllPrivilegesContainers(CMPrivilegedObject privilegedObject) {
			return Collections.emptyList(); //TODO check this
		}

//		@Override
//		public Iterable<PrivilegeContext> getPrivilegeContextList(CMPrivilegedObject privilegedObject) {
//			return Collections.emptyList(); //TODO check this
//		}

		@Override
		public List<PrivilegeContext> getPrivilegeContextList() {
			return Collections.emptyList(); //TODO check this
		}

	}

	private static final PrivilegeContext SYSTEM_PRIVILEGE_CONTEXT = new SystemPrivilegeContext();

	public static final PrivilegeContext systemPrivilegeContext() {
		return SYSTEM_PRIVILEGE_CONTEXT;
	}

	private PrivilegeContexts() {
		// prevents instantiation
	}

}
