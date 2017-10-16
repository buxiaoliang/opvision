package org.cmdbuild.service.rest.v2;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.cmdbuild.service.rest.v2.constants.Serialization.AREA;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ATTRIBUTE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.CARD;
import static org.cmdbuild.service.rest.v2.constants.Serialization.CLASS;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DETAILED;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;

import java.util.Set;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.cmdbuild.service.rest.v2.model.Attribute2;
import org.cmdbuild.service.rest.v2.model.Geometry;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

@Produces(APPLICATION_JSON)
public interface Geometries {

	@GET
	@Path("classes/{" + CLASS + "}/geoattributes/")
	ResponseMultiple<Attribute2> readAllAttributes( //
			@PathParam(CLASS) String classId, //
			@QueryParam(START) Integer offset, //
			@QueryParam(LIMIT) Integer limit, //
			@QueryParam(DETAILED) boolean detailed //
	);

	@GET
	@Path("classes/{" + CLASS + "}/geoattributes/{" + ATTRIBUTE + "}/")
	ResponseSingle<Attribute2> readAttribute( //
			@PathParam(CLASS) String classId, //
			@PathParam(ATTRIBUTE) String attributeId //
	);

	@GET
	@Path("classes/{" + CLASS + "}/geocards/")
	ResponseMultiple<Geometry> readAllGeometries( //
			@PathParam(CLASS) String classId, //
			@QueryParam(ATTRIBUTE) Set<? extends String> attributeId, //
			@QueryParam(AREA) Set<? extends String> area, //
			@QueryParam(START) Integer offset, //
			@QueryParam(LIMIT) Integer limit, //
			@QueryParam(DETAILED) boolean detailed //
	);

	@GET
	@Path("classes/{" + CLASS + "}/geocards/{" + CARD + "}/")
	ResponseSingle<Geometry> readGeometry( //
			@PathParam(CLASS) String classId, //
			@PathParam(CARD) Long cardId //
	);

}
