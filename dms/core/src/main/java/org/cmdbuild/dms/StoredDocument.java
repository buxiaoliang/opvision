package org.cmdbuild.dms;

import java.util.Date;

public class StoredDocument {

	private String name;
	private String uuid;
	private String description;
	private String version;
	private String author;
	private Date created;
	private Date modified;
	private String category;
	private Iterable<MetadataGroup> metadataGroups;
	private boolean versionable;

	private String path;

	public String getAuthor() {
		return author;
	}

	public void setAuthor(final String author) {
		this.author = author;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(final String description) {
		this.description = description;
	}

	public String getName() {
		return name;
	}

	public void setName(final String name) {
		this.name = name;
	}

	public String getPath() {
		return path;
	}

	public void setPath(final String path) {
		this.path = path;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(final String uuid) {
		this.uuid = uuid;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(final String version) {
		this.version = version;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(final String category) {
		this.category = category;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(final Date created) {
		this.created = created;
	}

	public Date getModified() {
		return modified;
	}

	public void setModified(final Date modified) {
		this.modified = modified;
	}

	public Iterable<MetadataGroup> getMetadataGroups() {
		return metadataGroups;
	}

	public void setMetadataGroups(final Iterable<MetadataGroup> metadataGroups) {
		this.metadataGroups = metadataGroups;
	}

	public boolean isVersionable() {
		return versionable;
	}

	public void setVersionable(final boolean versionable) {
		this.versionable = versionable;
	}

}
