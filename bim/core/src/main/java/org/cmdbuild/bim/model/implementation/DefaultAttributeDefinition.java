package org.cmdbuild.bim.model.implementation;

import org.cmdbuild.bim.model.AttributeDefinition;

public abstract class DefaultAttributeDefinition implements AttributeDefinition {

	private String ifcName;
	private String cmName;

	@Override
	public String getCmName() {
		return cmName;
	}

	@Override
	public void setCmName(final String label) {
		this.cmName = label;
	}

	public DefaultAttributeDefinition() {
	};

	public DefaultAttributeDefinition(final String name) {
		this.ifcName = name;
	}

	@Override
	public String getIfcName() {
		return ifcName;
	}

	@Override
	public abstract String toString();

}
