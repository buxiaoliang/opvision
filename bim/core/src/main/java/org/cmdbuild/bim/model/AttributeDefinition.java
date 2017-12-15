package org.cmdbuild.bim.model;

public interface AttributeDefinition {

	String getIfcName();

	String getCmName();

	void setCmName(String label);

	EntityDefinition getReference();

}
