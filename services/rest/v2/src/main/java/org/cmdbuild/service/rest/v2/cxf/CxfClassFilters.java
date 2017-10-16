package org.cmdbuild.service.rest.v2.cxf;

import org.cmdbuild.service.rest.v2.ClassFilters;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

public class CxfClassFilters implements ClassFilters {

	private final FiltersHelper delegate;

	public CxfClassFilters(final FiltersHelper delegate) {
		this.delegate = delegate;
	}

	@Override
	public ResponseSingle<Filter> create(final String classId, final Filter element) {
		return delegate.create(classId, element);
	}

	@Override
	public ResponseMultiple<Filter> readAll(final String classId, final Integer limit, final Integer offset) {
		return delegate.readAll(classId, limit, offset);
	}

	@Override
	public ResponseSingle<Filter> read(final String classId, final Long filterId) {
		return delegate.read(classId, filterId);
	}

	@Override
	public void update(final String classId, final Long filterId, final Filter element) {
		delegate.update(classId, filterId, element);
	}

	@Override
	public void delete(final String classId, final Long filterId) {
		delegate.delete(classId, filterId);
	}

}
