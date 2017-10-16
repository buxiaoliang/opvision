package org.cmdbuild.service.rest.v2;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.cmdbuild.service.rest.v2.constants.Serialization.CLASS_ID;
import static org.cmdbuild.service.rest.v2.constants.Serialization.FILTER_ID;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

@Path("classes/{" + CLASS_ID + "}/filters/")
@Produces(APPLICATION_JSON)
public interface ClassFilters {

	@POST
	@Path(EMPTY)
	ResponseSingle<Filter> create( //
			@PathParam(CLASS_ID) String classId, //
			Filter element //
	);

	@GET
	@Path(EMPTY)
	ResponseMultiple<Filter> readAll( //
			@PathParam(CLASS_ID) String classId, //
			@QueryParam(LIMIT) Integer limit, //
			@QueryParam(START) Integer offset //
	);

	@GET
	@Path("{" + FILTER_ID + "}/")
	ResponseSingle<Filter> read( //
			@PathParam(CLASS_ID) String classId, //
			@PathParam(FILTER_ID) Long filterId //
	);

	@PUT
	@Path("{" + FILTER_ID + "}/")
	void update( //
			@PathParam(CLASS_ID) String classId, //
			@PathParam(FILTER_ID) Long filterId, //
			Filter element //
	);

	@DELETE
	@Path("{" + FILTER_ID + "}/")
	void delete( //
			@PathParam(CLASS_ID) String classId, //
			@PathParam(FILTER_ID) Long filterId //
	);

}
