package org.cmdbuild.service.rest.v2.cxf;

import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

public interface FiltersHelper {

	ResponseSingle<Filter> create(String classId, Filter element);

	ResponseMultiple<Filter> readAll(String classId, Integer limit, Integer offset);

	ResponseSingle<Filter> read(String classId, Long filterId);

	void update(String classId, Long filterId, Filter element);

	void delete(String classId, Long filterId);

}