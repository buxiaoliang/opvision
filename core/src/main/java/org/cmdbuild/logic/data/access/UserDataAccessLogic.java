package org.cmdbuild.logic.data.access;

public class UserDataAccessLogic extends TransactionalDataAccessLogic {

	public static final String BEAN = "userDataAccessLogic";

	private final DataAccessLogic delegate;

	public UserDataAccessLogic(final DataAccessLogic delegate) {
		this.delegate = delegate;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

}
