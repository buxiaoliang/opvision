package org.cmdbuild.services.bim;

import org.cmdbuild.model.bim.StorableLayer;
import org.cmdbuild.model.bim.StorableProject;

public interface BimStoreManager {

	void disableProject(final String identifier);

	void enableProject(final String identifier);

	StorableLayer findRoot();

	boolean isActive(String className);

	StorableProject read(final String identifier);

	Iterable<StorableProject> readAll();

	Iterable<StorableLayer> readAllLayers();

	StorableLayer readLayer(String className);
	
	String getMapping(final String identifier);

	void saveActiveStatus(String className, String value);

	void saveRoot(String className, boolean value);

	void saveRootReference(String className, String value);

	void write(final StorableProject project);

}
