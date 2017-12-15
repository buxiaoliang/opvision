package org.cmdbuild.auth.acl;

import java.util.List;

public interface PrivilegeContext {

	interface PrivilegedObjectMetadata {

		/**
		 * 
		 * @return a list of filters. Each filter is a string. It is a list in
		 *         case of default group (sum of filters of all groups)
		 */
		public List<String> getFilters();

		/**
		 * 
		 * @return a list of disabled attributes. In case of default group it is
		 *         the intersection of disabled attributes of all groups to
		 *         which the user belongs. In case of selected group are
		 *         disabled attributes for a class
		 */
		public List<String> getAttributesPrivileges();

	}
	
	/**
	 * a container of privileges, useful when we have different privilege groups
	 * with different metadata (example: WRITE with filter field=A and READ with filter field=B)
	 */
	interface PrivilegesContainer {
		
		public List<CMPrivilege> getObjectPrivileges();

		public PrivilegedObjectMetadata getPrivilegedObjectMetadata();
		
		public String getPrivilegesGroupId();
	}

	boolean hasPrivilege(CMPrivilege privilege);

	/**
	 * Returns if the user has administrator privileges.
	 * 
	 * Administrators are those users that can change the system configuration,
	 * manage users, groups, their menus and ACLs.
	 * 
	 * @return if the user has administrator privileges
	 */
	boolean hasAdministratorPrivileges();

	/**
	 * Returns if the user has database designer privileges.
	 * 
	 * Database Designers can change the DB schema.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */
	public boolean hasDatabaseDesignerPrivileges();

	boolean hasPrivilege(CMPrivilege requested, CMPrivilegedObject privilegedObject);

	boolean hasReadAccess(CMPrivilegedObject privilegedObject);

	boolean hasWriteAccess(CMPrivilegedObject privilegedObject);

	/**
	 * Returns some metadata for a PrivilegedObject.
	 * 
	 * @param privilegedObject
	 * @return
	 */
	PrivilegedObjectMetadata getMetadata(CMPrivilegedObject privilegedObject);
	
	/**
	 * get list of ALL privileges/metadata of an object; new privileges interface, to support multi group permission model
	 * this method is supposed to be used from interface services, to build complex filters with different permissions 
	 * @param privilegedObject
	 * @return 
	 */
	public Iterable<PrivilegesContainer> getAllPrivilegesContainers(CMPrivilegedObject privilegedObject);
	
	public List<PrivilegeContext> getPrivilegeContextList();

	/**
	 * Reports currently use SQL for queries, so there is no way to give safe
	 * access to user data only. It has to fall back to {@link
	 * hasAdministratorPrivileges()}.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */
	// boolean hasReportDesignerPrivileges();

	/**
	 * Returns if the user has workflow designer privileges.
	 * 
	 * Workflow Designers can change the process definition.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */
	// boolean hasWorkflowDesignerPrivileges();
}
