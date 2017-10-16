package org.cmdbuild.service.rest.v2.cxf;

import org.cmdbuild.dao.view.CMDataView;

public class ErrorHandlerFacadeImpl extends ForwardingErrorHandler implements ErrorHandlerFacade {

	private final ErrorHandler delegate;
	private final CMDataView dataView;

	public ErrorHandlerFacadeImpl(final ErrorHandler delegate, final CMDataView dataView) {
		this.delegate = delegate;
		this.dataView = dataView;
	}

	@Override
	protected ErrorHandler delegate() {
		return delegate;
	}

	@Override
	public void checkClass(final String value) {
		if (dataView.findClass(value) == null) {
			classNotFound(value);
		}
	}

}
