package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.CONFIGURATION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DESCRIPTION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.NAME;
import static org.cmdbuild.service.rest.v2.constants.Serialization.SHARED;
import static org.cmdbuild.service.rest.v2.constants.Serialization.TARGET;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@XmlRootElement
public class Filter extends ModelWithLongId {

	private String name;
	private String description;
	private String target;
	private String configuration;
	private boolean shared;

	Filter() {
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

	@XmlAttribute(name = TARGET)
	public String getTarget() {
		return target;
	}

	void setTarget(final String target) {
		this.target = target;
	}

	@XmlAttribute(name = CONFIGURATION)
	public String getConfiguration() {
		return configuration;
	}

	void setConfiguration(final String configuration) {
		this.configuration = configuration;
	}

	@XmlAttribute(name = SHARED)
	public boolean isShared() {
		return shared;
	}

	void setShared(final boolean shared) {
		this.shared = shared;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof Filter)) {
			return false;
		}

		final Filter other = Filter.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.getId(), other.getId()) //
				.append(this.name, other.name) //
				.append(this.description, other.description) //
				.append(this.target, other.target) //
				.append(this.configuration, other.configuration) //
				.append(this.shared, other.shared) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(getId()) //
				.append(name) //
				.append(description) //
				.append(target) //
				.append(configuration) //
				.append(shared) //
				.toHashCode();
	}

}
