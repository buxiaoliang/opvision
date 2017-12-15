package org.cmdbuild.bim.service.bimserver;

import java.io.File;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.BimService;
import org.cmdbuild.bim.service.ReferenceAttribute;
import org.joda.time.DateTime;

public class BimserverService implements BimService {

	private final BimserverClient client;

	public BimserverService(final BimserverClient client) {
		this.client = client;
	}

	@Override
	public DateTime checkin(final String projectId, final File file, final String ifcVersion) {
		return client.checkin(projectId, file, ifcVersion);
	}

	@Override
	public BimProject createProject(final String projectName, final String description, final String ifcVersion) {
		return client.createProjectWithName(projectName, description, ifcVersion);
	}

	@Override
	public void enableProject(final String projectId) {
		client.enableProject(projectId);
	}

	@Override
	public void disableProject(final String projectId) {
		client.disableProject(projectId);
	}

	@Override
	public DataHandler downloadIfc(final String revisionId, final String ifcVersion) {
		return client.downloadIfc(revisionId, ifcVersion);
	}

	@Override
	public Iterable<Entity> getEntitiesByType(final String className, final String revisionId) {
		return client.getEntitiesByType(className, revisionId);
	}

	@Override
	public Entity getEntityByOid(final String revisionId, final String objectId) {
		return client.getEntityByOid(revisionId, objectId);
	}

	@Override
	public BimProject getProjectByPoid(final String projectId) {
		return client.getProjectByPoid(projectId);
	}

	@Override
	public Entity getReferencedEntity(final ReferenceAttribute reference, final String revisionId) {
		return client.getReferencedEntity(reference, revisionId);
	}

	@Override
	public String getLastRevisionOfProject(final String projectId) {
		return client.getLastRevisionOfProject(projectId);
	}

	@Override
	public BimProject updateProject(final BimProject project) {
		return client.updateProject(project);
	}

}