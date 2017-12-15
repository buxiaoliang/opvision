package org.cmdbuild.bim.model.implementation;

import org.cmdbuild.bim.model.EntityDefinition;

public class ReferenceAttributeDefinition extends DefaultAttributeDefinition {

	private EntityDefinition reference;

	public ReferenceAttributeDefinition(final String attributeName) {
		super(attributeName);
	}

	@Override
	public EntityDefinition getReference() {
		return reference;
	}

	public void setReference(final EntityDefinition referencedEntity) {
		this.reference = referencedEntity;
	}

	@Override
	public String toString() {
		return "REFERENCE TO --> " + this.getIfcName();
	}

}
