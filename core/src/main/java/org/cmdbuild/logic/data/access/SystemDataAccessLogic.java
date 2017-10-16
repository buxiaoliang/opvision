package org.cmdbuild.logic.data.access;

public class SystemDataAccessLogic extends TransactionalDataAccessLogic {

	public static final String BEAN = "systemDataAccessLogic";

	private final DataAccessLogic delegate;

	public SystemDataAccessLogic(final DataAccessLogic delegate) {
		this.delegate = delegate;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

}
