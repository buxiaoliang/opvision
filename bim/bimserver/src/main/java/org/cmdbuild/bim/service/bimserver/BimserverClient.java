package org.cmdbuild.bim.service.bimserver;

import java.io.File;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.ReferenceAttribute;
import org.joda.time.DateTime;

public interface BimserverClient {

	DateTime checkin(String projectId, File file, String ifcVersion);

	void connect();

	BimProject createProjectWithName(final String projectName, String description, String ifcVersion);

	void disableProject(String projectId);

	void disconnect();

	DataHandler downloadIfc(String roid, String ifcVersion);

	void enableProject(String projectId);

	Iterable<Entity> getEntitiesByType(String type, String revisionId);

	Entity getEntityByOid(String revisionId, String objectId);

	String getLastRevisionOfProject(String projectId);

	BimProject getProjectByPoid(String projectId);

	Entity getReferencedEntity(ReferenceAttribute reference, String revisionId);

	boolean isConnected();

	BimProject updateProject(BimProject project);

}
