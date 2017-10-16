package org.cmdbuild.service.rest.v2.cxf;

import org.cmdbuild.service.rest.v2.ProcessFilters;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

public class CxfProcessFilters implements ProcessFilters {

	private final FiltersHelper delegate;

	public CxfProcessFilters(final FiltersHelper delegate) {
		this.delegate = delegate;
	}

	@Override
	public ResponseSingle<Filter> create(final String processId, final Filter element) {
		return delegate.create(processId, element);
	}

	@Override
	public ResponseMultiple<Filter> readAll(final String processId, final Integer limit, final Integer offset) {
		return delegate.readAll(processId, limit, offset);
	}

	@Override
	public ResponseSingle<Filter> read(final String processId, final Long filterId) {
		return delegate.read(processId, filterId);
	}

	@Override
	public void update(final String processId, final Long filterId, final Filter element) {
		delegate.update(processId, filterId, element);
	}

	@Override
	public void delete(final String processId, final Long filterId) {
		delegate.delete(processId, filterId);
	}

}
