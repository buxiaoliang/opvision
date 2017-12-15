package org.cmdbuild.auth.acl;

public class DefaultPrivileges {

	/**
	 * SimplePrivilege does not imply any other privilege
	 */
	public static class SimplePrivilege implements CMPrivilege {

		@Override
		public boolean implies(final CMPrivilege privilege) {
			return privilege == this;
		}
	};

	/**
	 * Read access privilege
	 */
	public static final CMPrivilege READ = new SimplePrivilege();

	/**
	 * Write access implies read access
	 */
	public static final CMPrivilege WRITE = new SimplePrivilege() {

		@Override
		public boolean implies(final CMPrivilege privilege) {
			return super.implies(privilege) || privilege == READ;
		}
	};

	/**
	 * No privileges
	 */
	public static final CMPrivilege NONE = new SimplePrivilege() {

		@Override
		public boolean implies(final CMPrivilege privilege) {
			return false;
		}
	};

	/**
	 * God privilege is used because people belonging to an administration group
	 * are granted full privileges.
	 */
	public static final CMPrivilege GOD = new CMPrivilege() {

		@Override
		public boolean implies(final CMPrivilege privilege) {
			return true;
		}
	};

	/**
	 * Database Designers can change the DB schema.
	 */
	public static final CMPrivilege DATABASE_DESIGNER = new SimplePrivilege();

	/**
	 * Administrators are those users that can change the system configuration,
	 * manage users, groups, their menus and ACLs.
	 */
	public static final CMPrivilege ADMINISTRATOR = new SimplePrivilege();

	public static final String GLOBAL_PRIVILEGE_ID = "GLOBAL";

	/**
	 * dump privilege const name; useful to show prvileges in logs<br>
	 * TODO this can be written better refactoring the CMPrivilege framework, and including a 'name' property in privileges
	 * @param privilege
	 * @return 
	 */
	public static String privilegeToString(CMPrivilege privilege) {
		if (privilege == READ) {
			return "READ";
		} else if (privilege == WRITE) {
			return "WRITE";
		} else if (privilege == NONE) {
			return "NONE";
		} else if (privilege == GOD) {
			return "GOD";
		} else if (privilege == DATABASE_DESIGNER) {
			return "DATABASE_DESIGNER";
		} else if (privilege == ADMINISTRATOR) {
			return "ADMINISTRATOR";
		} else {
			return "unknown[" + privilege + "]";
		}
	}
	
}
