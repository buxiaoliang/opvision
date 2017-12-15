package org.cmdbuild.bim.service;

import java.io.File;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.joda.time.DateTime;

public interface BimService {

	// File management

	DateTime checkin(String projectId, File file, String ifcVersion);

	DataHandler downloadIfc(String revisionId, String ifcVersion);

	// Project management

	BimProject createProject(String name, String description, String ifcVersion);

	BimProject updateProject(BimProject project);

	BimProject getProjectByPoid(String projectId);

	void disableProject(String projectId);

	void enableProject(String projectId);

	// File contents

	Iterable<Entity> getEntitiesByType(String className, String revisionId);

	Entity getEntityByOid(String revisionId, String objectId);

	String getLastRevisionOfProject(String projectId);

	Entity getReferencedEntity(ReferenceAttribute reference, String revisionId);

}
