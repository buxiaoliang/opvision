package org.cmdbuild.logic.bim.project;

import org.cmdbuild.services.bim.BimPersistence.PersistenceProject;
import org.joda.time.DateTime;

public class DefaultPersistenceProject implements PersistenceProject {

	private Long cmId;
	private String name, description, importMapping, projectId;
	private boolean active;
	private DateTime lastCheckin;
	private Iterable<String> cardBinding;

	@Override
	public String getName() {
		return name;
	}

	@Override
	public boolean isActive() {
		return active;
	}

	@Override
	public String getImportMapping() {
		return importMapping;
	}

	@Override
	public void setImportMapping(final String importMapping) {
		this.importMapping = importMapping;
	}

	@Override
	public String getDescription() {
		return description;
	}


	@Override
	public DateTime getLastCheckin() {
		return lastCheckin;
	}

	@Override
	public Iterable<String> getCardBinding() {
		return this.cardBinding;
	}

	@Override
	public void setProjectId(final String projectId) {
		this.projectId = projectId;
	}

	@Override
	public void setLastCheckin(final DateTime lastCheckin) {
		this.lastCheckin = lastCheckin;
	}

	@Override
	public String getProjectId() {
		return projectId;
	}

	@Override
	public Long getCmId() {
		return cmId;
	}

	@Override
	public void setName(final String name) {
		this.name = name;
	}

	@Override
	public void setDescription(final String description) {
		this.description = description;
	}

	@Override
	public void setCardBinding(final Iterable<String> cardBinding) {
		this.cardBinding = cardBinding;
	}

	@Override
	public void setActive(final boolean active) {
		this.active = active;
	}

}