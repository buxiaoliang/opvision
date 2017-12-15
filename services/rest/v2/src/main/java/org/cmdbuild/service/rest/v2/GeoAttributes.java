package org.cmdbuild.service.rest.v2;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ATTRIBUTE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.CLASS;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DETAILED;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;


import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import static org.apache.commons.lang3.StringUtils.EMPTY;

import org.cmdbuild.service.rest.v2.model.Attribute2;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

@Path("classes/{" + CLASS + "}/geoattributes/")
@Produces(APPLICATION_JSON)
public interface GeoAttributes {

	@GET
	@Path(EMPTY)
	ResponseMultiple<Attribute2> readAllAttributes( //
			@PathParam(CLASS) String classId, //
			@QueryParam(START) Integer offset, //
			@QueryParam(LIMIT) Integer limit, //
			@QueryParam(DETAILED) boolean detailed //
	);

	@GET
	@Path("{" + ATTRIBUTE + "}/")
	ResponseSingle<Attribute2> readAttribute( //
			@PathParam(CLASS) String classId, //
			@PathParam(ATTRIBUTE) String attributeId //
	);

}
