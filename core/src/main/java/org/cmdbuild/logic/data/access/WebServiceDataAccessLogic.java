package org.cmdbuild.logic.data.access;

public class WebServiceDataAccessLogic extends TransactionalDataAccessLogic {

	public static final String BEAN = "webServiceDataAccessLogic";

	private final DataAccessLogic delegate;

	public WebServiceDataAccessLogic(final DataAccessLogic delegate) {
		this.delegate = delegate;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

}
