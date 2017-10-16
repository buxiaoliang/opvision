package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.ATTRIBUTE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DESCRIPTION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.INDEX;
import static org.cmdbuild.service.rest.v2.constants.Serialization.METADATA;
import static org.cmdbuild.service.rest.v2.constants.Serialization.NAME;
import static org.cmdbuild.service.rest.v2.constants.Serialization.SUBTYPE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.TYPE;

import java.util.Map;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@XmlRootElement(name = ATTRIBUTE)
public class Attribute2 extends ModelWithStringId {

	private String name;
	private String description;
	private String type;
	private String subtype;
	private Integer index;
	private Map<String, Object> metadata;

	Attribute2() {
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

	@XmlAttribute(name = TYPE)
	public String getType() {
		return type;
	}

	void setType(final String type) {
		this.type = type;
	}

	@XmlAttribute(name = SUBTYPE)
	public String getSubtype() {
		return subtype;
	}

	void setSubtype(final String subtype) {
		this.subtype = subtype;
	}

	@XmlAttribute(name = INDEX)
	public Integer getIndex() {
		return index;
	}

	void setIndex(final Integer index) {
		this.index = index;

	}

	@XmlElement(name = METADATA, nillable = true)
	public Map<String, Object> getMetadata() {
		return metadata;
	}

	void setMetadata(final Map<String, Object> metadata) {
		this.metadata = metadata;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof Attribute2)) {
			return false;
		}

		final Attribute2 other = Attribute2.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.getId(), other.getId()) //
				.append(this.name, other.name) //
				.append(this.description, other.description) //
				.append(this.type, other.type) //
				.append(this.subtype, other.subtype) //
				.append(this.index, other.index) //
				.append(this.metadata, other.metadata) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(getId()) //
				.append(name) //
				.append(description) //
				.append(type) //
				.append(subtype) //
				.append(index) //
				.append(metadata) //
				.toHashCode();
	}

}
