package org.cmdbuild.auth;

import static org.cmdbuild.common.Constants.ROLE_CLASS_NAME;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;

/**
 * Fetches the users in the legacy database tables decided by the DBA
 */
public abstract class LegacyDBUserFetcher extends DBUserFetcher {

	public static interface Configuration extends DBUserFetcher.Configuration {

	}

	/**
	 * Usable by subclasses only.
	 */
	protected LegacyDBUserFetcher() {
	}

	@Override
	protected abstract Configuration configuration();

	@Override
	protected final CMClass userClass() {
		return view().findClass("User");
	}

	@Override
	protected final CMClass roleClass() {
		return view().findClass(ROLE_CLASS_NAME);
	}

	@Override
	protected final String userEmailAttribute() {
		return "Email";
	}

	@Override
	protected final String userNameAttribute() {
		return "Username";
	}

	@Override
	protected final String userDescriptionAttribute() {
		return "Description";
	}

	@Override
	protected final String userPasswordAttribute() {
		return "Password";
	}

	@Override
	protected final String userIdAttribute() {
		return "Id";
	}

	@Override
	protected CMDomain userGroupDomain() {
		return view().findDomain("UserRole");
	}

	@Override
	protected boolean extendedInformation() {
		return true;
	}

}
