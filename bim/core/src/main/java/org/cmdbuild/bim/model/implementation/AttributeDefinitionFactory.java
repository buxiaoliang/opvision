package org.cmdbuild.bim.model.implementation;

import org.cmdbuild.bim.model.AttributeDefinition;
import org.cmdbuild.bim.service.BimError;

public class AttributeDefinitionFactory {

	private final String type;

	public AttributeDefinitionFactory(final String type) {
		this.type = type;
	}

	public AttributeDefinition createAttribute(final String attributeName) {
		if (type.equals("simple")) {
			return new SimpleAttributeDefinition(attributeName);
		} else if (type.equals("reference")) {
			return new ReferenceAttributeDefinition(attributeName);
		} else if (type.equals("list")) {
			return new ListAttributeDefinition(attributeName);
		} else {
			throw new BimError("Unsupported attribute type " + this.type);
		}
	}

}
