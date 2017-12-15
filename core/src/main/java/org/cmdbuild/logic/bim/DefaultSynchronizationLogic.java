package org.cmdbuild.logic.bim;

import static org.cmdbuild.logic.bim.project.ConversionUtils.TO_MODIFIABLE_PERSISTENCE_PROJECT;

import java.util.List;

import org.cmdbuild.bim.mapper.xml.XmlImportCatalogFactory;
import org.cmdbuild.bim.model.Catalog;
import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.model.EntityDefinition;
import org.cmdbuild.services.bim.BimFacade;
import org.cmdbuild.services.bim.BimPersistence;
import org.cmdbuild.services.bim.BimPersistence.PersistenceProject;
import org.cmdbuild.services.bim.connector.Mapper;

public class DefaultSynchronizationLogic implements SynchronizationLogic {

	private final BimFacade bimServiceFacade;
	private final BimPersistence bimPersistence;
	private final Mapper mapper;

	public DefaultSynchronizationLogic( //
			final BimFacade bimServiceFacade, //
			final BimPersistence bimPersistence, //
			final Mapper mapper) {

		this.bimPersistence = bimPersistence;
		this.bimServiceFacade = bimServiceFacade;
		this.mapper = mapper;
	}

	@Override
	public void importIfc(final String projectId) {
		
		logger.info("start ifc '{}' import", projectId);
		final PersistenceProject immutableProject = bimPersistence.read(projectId);
		final String xmlMapping = immutableProject.getImportMapping();
		logger.info("read import mapping for bim project");
		logger.debug("'{}'", xmlMapping);
		final Catalog catalog = XmlImportCatalogFactory.withXmlStringMapper(xmlMapping).create();

		for (final EntityDefinition entityDefinition : catalog.getEntitiesDefinitions()) {
			final List<Entity> source = bimServiceFacade.readEntityFromProject(entityDefinition,
					immutableProject.getProjectId());
			if (source.size() > 0) {
				mapper.update(source);
			}
		}
		
		final PersistenceProject projectSynchronized = TO_MODIFIABLE_PERSISTENCE_PROJECT.apply(immutableProject);
		projectSynchronized.setProjectId(projectId);
		bimPersistence.saveProject(projectSynchronized);
		logger.info("import done");
	}

}
