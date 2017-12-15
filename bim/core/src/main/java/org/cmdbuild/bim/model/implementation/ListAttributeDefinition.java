package org.cmdbuild.bim.model.implementation;

import java.util.List;

import org.cmdbuild.bim.model.EntityDefinition;

import com.google.common.collect.Lists;

public class ListAttributeDefinition extends DefaultAttributeDefinition {

	private EntityDefinition reference = EntityDefinition.NULL_ENTITYDEFINITION;
	private final List<EntityDefinition> allReferences = Lists.newArrayList();

	public List<EntityDefinition> getAllReferences() {
		return allReferences;
	}

	public ListAttributeDefinition(final String attributeName) {
		super(attributeName);
	}

	public void setReference(final EntityDefinition referencedEntity) {
		this.reference = referencedEntity;
	}

	@Override
	public EntityDefinition getReference() {
		return reference;
	}

	@Override
	public String toString() {
		return "LIST OF --> " + this.getIfcName();
	}

}
