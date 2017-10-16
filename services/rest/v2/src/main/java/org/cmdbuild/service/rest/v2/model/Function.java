package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.DESCRIPTION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.METADATA;
import static org.cmdbuild.service.rest.v2.constants.Serialization.NAME;

import java.util.Map;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@XmlRootElement
public class Function extends ModelWithLongId {

	private String name;
	private String description;
	private Map<String, Object> metadata;

	Function() {
		// package visibility
	}

	@XmlAttribute(name = NAME)
	public String getName() {
		return name;
	}

	void setName(final String name) {
		this.name = name;
	}

	@XmlAttribute(name = DESCRIPTION)
	public String getDescription() {
		return description;
	}

	void setDescription(final String description) {
		this.description = description;
	}

	@XmlElement(name = METADATA, nillable = true)
	public Map<String, Object> getMetadata() {
		return metadata;
	}

	protected void setMetadata(final Map<String, Object> metadata) {
		this.metadata = metadata;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof Function)) {
			return false;
		}

		final Function other = Function.class.cast(obj);

		return new EqualsBuilder() //
				.append(this.getId(), other.getId()) //
				.append(this.name, other.name) //
				.append(this.description, other.description) //
				.append(this.metadata, other.metadata) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(this.getId()) //
				.append(this.name) //
				.append(this.description) //
				.append(this.metadata) //
				.toHashCode();
	}

}
