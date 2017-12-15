package org.cmdbuild.services.bim;

import static org.cmdbuild.bim.utils.BimConstants.INVALID_ID;
import static org.cmdbuild.bim.utils.BimConstants.isValidId;

import java.io.File;
import java.util.List;

import javax.activation.DataHandler;

import org.cmdbuild.auth.logging.LoggingSupport;
import org.cmdbuild.bim.mapper.Reader;
import org.cmdbuild.bim.mapper.xml.BimReader;
import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.model.EntityDefinition;
import org.cmdbuild.bim.service.BimError;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.BimService;
import org.joda.time.DateTime;
import org.slf4j.Logger;

public class DefaultBimFacade implements BimFacade {

	private final BimService service;
	private final Reader reader;

	Logger logger = LoggingSupport.logger;

	public DefaultBimFacade(final BimService bimservice) {
		this.service = bimservice;
		reader = new BimReader(bimservice);
	}

	@Override
	public BimFacadeProject createProject(final BimFacadeProject project) {
		final BimProject createdProject = service.createProject(project.getName(), project.getDescription(),
				project.getIfcVersion());
		final String projectId = createdProject.getIdentifier();
		if (project.getFile() != null) {
			final DateTime lastCheckin = service.checkin(createdProject.getIdentifier(), project.getFile(),
					project.getIfcVersion());
			final BimProject updatedProject = service.getProjectByPoid(projectId);
			createdProject.setLastCheckin(lastCheckin);
			final String lastRevisionOfProject = service.getLastRevisionOfProject(updatedProject.getIdentifier());
			if (!isValidId(lastRevisionOfProject)) {
				throw new BimError("Upload failed");
			}
		}
		final BimFacadeProject facadeProject = from(createdProject);
		return facadeProject;
	}

	@Override
	public BimFacadeProject updateProject(final BimFacadeProject inputProject) {
		final String projectId = inputProject.getProjectId();
		BimProject bimProject = service.getProjectByPoid(projectId);
		if (inputProject.getFile() != null) {
			final DateTime checkin = service.checkin(projectId, inputProject.getFile(), inputProject.getIfcVersion());
			bimProject = service.getProjectByPoid(projectId);
			bimProject.setLastCheckin(checkin);
		}
		if (!inputProject.getDescription().equals(bimProject.getDescription())) {
			bimProject.setDescription(inputProject.getDescription());
			bimProject = service.updateProject(bimProject);
		}
		if (inputProject.isActive() != bimProject.isActive()) {
			if (inputProject.isActive()) {
				service.enableProject(projectId);
			} else {
				service.disableProject(projectId);
			}
		}
		final BimFacadeProject facadeProject = from(bimProject);
		return facadeProject;
	}

	private static BimFacadeProject from(final BimProject createdProject) {
		final BimFacadeProject project = new BimFacadeProject() {

			@Override
			public boolean isActive() {
				return createdProject.isActive();
			}

			@Override
			public String getProjectId() {
				return createdProject.getIdentifier();
			}

			@Override
			public String getName() {
				return createdProject.getName();
			}

			@Override
			public DateTime getLastCheckin() {
				return createdProject.getLastCheckin();
			}

			@Override
			public File getFile() {
				throw new UnsupportedOperationException();
			}

			@Override
			public void setLastCheckin(final DateTime lastCheckin) {
				throw new UnsupportedOperationException();
			}

			@Override
			public String getDescription() {
				return createdProject.getDescription();
			}

			@Override
			public String getIfcVersion() {
				return createdProject.getIfcVersion();
			}

		};
		return project;

	}

	@Override
	public void disableProject(final BimFacadeProject project) {
		login();
		service.disableProject(project.getProjectId());
		logout();

	}

	@Override
	public void enableProject(final BimFacadeProject project) {
		login();
		service.enableProject(project.getProjectId());
		logout();
	}

	@Override
	public DataHandler downloadIfc(final String projectId) {
		final BimProject project = service.getProjectByPoid(projectId);
		final String revisionId = service.getLastRevisionOfProject(projectId);
		if ((INVALID_ID).equals(revisionId)) {
			return null;
		}
		return service.downloadIfc(revisionId, project.getIfcVersion());
	}

	@Override
	public List<Entity> readEntityFromProject(final EntityDefinition entityDefinition, final String projectId) {
		login();
		final String revisionId = service.getLastRevisionOfProject(projectId);
		final List<Entity> source = reader.readEntities(revisionId, entityDefinition);
		logout();
		return source;
	}

	private void login() {
	}

	private void logout() {
	}

	@Override
	public String getLastRevisionOfProject(final String projectId) {
		return service.getLastRevisionOfProject(projectId);
	}

	@Override
	public String fetchGlobalIdFromObjectId(final String objectId, final String revisionId) {
		final Entity entity = service.getEntityByOid(revisionId, objectId);
		return entity.getKey();
	}

}
