package org.cmdbuild.services.bim;

import org.cmdbuild.model.bim.StorableLayer;
import org.joda.time.DateTime;

public interface BimPersistence {

	public interface PersistenceProject {

		Iterable<String> getCardBinding();

		Long getCmId();

		String getDescription();

		String getImportMapping();

		DateTime getLastCheckin();

		String getName();

		String getProjectId();

		boolean isActive();

		void setActive(boolean active);

		void setCardBinding(Iterable<String> cardBinding);

		void setDescription(String description);

		void setImportMapping(String importMapping);

		void setLastCheckin(DateTime lastCheckin);

		void setName(String name);

		void setProjectId(String projectId);

	}

	void disableProject(PersistenceProject project);

	void enableProject(PersistenceProject project);

	StorableLayer findRoot();

	String getProjectIdFromCardId(Long cardId);

	boolean isActiveLayer(String classname);

	Iterable<StorableLayer> listLayers();

	PersistenceProject read(String projectId);

	Iterable<PersistenceProject> readAll();

	StorableLayer readLayer(String className);
	
	String getMapping(PersistenceProject project);

	void saveActiveFlag(String className, String value);

	void saveProject(PersistenceProject project);

	void saveRootFlag(String className, boolean value);

	void saveRootReferenceName(String className, String value);

}
