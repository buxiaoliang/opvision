package org.cmdbuild.bim.model;

public interface Catalog {

	Iterable<EntityDefinition> getEntitiesDefinitions();

	@Override
	String toString();

	int getSize();
}
