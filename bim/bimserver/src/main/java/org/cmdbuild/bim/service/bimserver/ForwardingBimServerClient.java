package org.cmdbuild.bim.service.bimserver;

import java.io.File;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.ReferenceAttribute;
import org.joda.time.DateTime;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingBimServerClient extends ForwardingObject implements BimserverClient {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingBimServerClient() {
	}

	@Override
	public DateTime checkin(final String projectId, final File file, final String ifcVersion) {
		return delegate().checkin(projectId, file, ifcVersion);
	}

	@Override
	public void connect() {
		delegate().connect();
	}

	@Override
	public BimProject createProjectWithName(final String projectName, final String description,
			final String ifcVersion) {
		return delegate().createProjectWithName(projectName, description, ifcVersion);
	}

	@Override
	public void disableProject(final String projectId) {
		delegate().disableProject(projectId);
	}

	@Override
	public void disconnect() {
		delegate().disconnect();
	}

	@Override
	public DataHandler downloadIfc(final String roid, final String ifcVersion) {
		return delegate().downloadIfc(roid, ifcVersion);
	}

	@Override
	public void enableProject(final String projectId) {
		delegate().enableProject(projectId);
	}

	@Override
	public Iterable<Entity> getEntitiesByType(final String type, final String revisionId) {
		return delegate().getEntitiesByType(type, revisionId);
	}

	@Override
	public Entity getEntityByOid(final String revisionId, final String objectId) {
		return delegate().getEntityByOid(revisionId, objectId);
	}

	@Override
	public String getLastRevisionOfProject(final String projectId) {
		return delegate().getLastRevisionOfProject(projectId);
	}

	@Override
	public BimProject getProjectByPoid(final String projectId) {
		return delegate().getProjectByPoid(projectId);
	}

	@Override
	public Entity getReferencedEntity(final ReferenceAttribute reference, final String revisionId) {
		return delegate().getReferencedEntity(reference, revisionId);
	}

	@Override
	public boolean isConnected() {
		return delegate().isConnected();
	}

	@Override
	protected abstract BimserverClient delegate();

}
