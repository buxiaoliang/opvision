package org.cmdbuild.services.bim;

import java.io.File;
import java.util.List;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.model.EntityDefinition;
import org.joda.time.DateTime;

public interface BimFacade {

	public interface BimFacadeProject {

		String getProjectId();

		String getName();

		String getDescription();

		String getIfcVersion();

		boolean isActive();

		DateTime getLastCheckin();

		void setLastCheckin(DateTime lastCheckin);

		File getFile();

	}

	// CRUD operations on projects

	BimFacadeProject createProject(BimFacadeProject project);

	BimFacadeProject updateProject(BimFacadeProject project);

	void disableProject(BimFacadeProject project);

	void enableProject(BimFacadeProject project);

	DataHandler downloadIfc(String projectId);

	String getLastRevisionOfProject(String projectId);

	// import-connector

	List<Entity> readEntityFromProject(EntityDefinition entityDefinition, String projectId);

	// viewer

	String fetchGlobalIdFromObjectId(String objectId, String revisionId);

}
