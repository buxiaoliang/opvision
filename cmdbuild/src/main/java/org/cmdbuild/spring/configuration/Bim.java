package org.cmdbuild.spring.configuration;

import javax.sql.DataSource;

import org.cmdbuild.bim.service.BimService;
import org.cmdbuild.bim.service.bimserver.BimserverClient;
import org.cmdbuild.bim.service.bimserver.BimserverConfiguration;
import org.cmdbuild.bim.service.bimserver.BimserverService;
import org.cmdbuild.bim.service.bimserver.DefaultBimserverClient;
import org.cmdbuild.bim.service.bimserver.SmartBimserverClient;
import org.cmdbuild.config.BimProperties;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.converter.StorableProjectConverter;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.data.store.Stores;
import org.cmdbuild.data.store.dao.DataViewStore;
import org.cmdbuild.data.store.dao.StorableConverter;
import org.cmdbuild.logic.bim.DefaultLayerLogic;
import org.cmdbuild.logic.bim.DefaultSynchronizationLogic;
import org.cmdbuild.logic.bim.DefaultViewerLogic;
import org.cmdbuild.logic.bim.LayerLogic;
import org.cmdbuild.logic.bim.SynchronizationLogic;
import org.cmdbuild.logic.bim.ViewerLogic;
import org.cmdbuild.logic.bim.project.DefaultProjectLogic;
import org.cmdbuild.logic.bim.project.ProjectLogic;
import org.cmdbuild.logic.data.DataDefinitionLogic;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.model.bim.StorableLayer;
import org.cmdbuild.model.bim.StorableProject;
import org.cmdbuild.services.bim.BimDataModelManager;
import org.cmdbuild.services.bim.BimDataView;
import org.cmdbuild.services.bim.BimFacade;
import org.cmdbuild.services.bim.BimPersistence;
import org.cmdbuild.services.bim.BimStoreManager;
import org.cmdbuild.services.bim.DefaultBimDataModelManager;
import org.cmdbuild.services.bim.DefaultBimDataView;
import org.cmdbuild.services.bim.DefaultBimFacade;
import org.cmdbuild.services.bim.DefaultBimPersistence;
import org.cmdbuild.services.bim.DefaultBimStoreManager;
import org.cmdbuild.services.bim.DefaultRelationPersistence;
import org.cmdbuild.services.bim.RelationPersistence;
import org.cmdbuild.services.bim.connector.BimCardDiffer;
import org.cmdbuild.services.bim.connector.CardDiffer;
import org.cmdbuild.services.bim.connector.DefaultBimMapper;
import org.cmdbuild.services.bim.connector.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Bim {

	@Autowired
	private DataDefinitionLogic dataDefinitionLogic;

	@Autowired
	private LookupLogic lookupLogic;

	@Autowired
	private DataSource dataSource;

	@Autowired
	@Qualifier("system")
	private CMDataView systemDataView;

	@Bean
	protected BimserverConfiguration bimConfiguration() {
		return BimProperties.getInstance();
	}

	@Bean
	protected BimserverClient bimserverClient() {
		return new SmartBimserverClient(new DefaultBimserverClient(bimConfiguration()));
	}

	@Bean
	protected BimService bimService() {
		return new BimserverService(bimserverClient());
	}

	@Bean
	public ProjectLogic projectLogic() {
		return new DefaultProjectLogic(bimServiceFacade(), bimDataPersistence());
	}

	@Bean
	public LayerLogic layerLogic() {
		return new DefaultLayerLogic(bimDataPersistence(), bimDataView(), bimDataModelManager());
	}

	@Bean
	public SynchronizationLogic synchronizationLogic() {
		return new DefaultSynchronizationLogic(bimServiceFacade(), bimDataPersistence(), mapper());
	}

	@Bean
	public ViewerLogic viewerLogic() {
		return new DefaultViewerLogic(bimServiceFacade(), bimDataPersistence(), bimDataView());
	}

	@Bean
	protected BimFacade bimServiceFacade() {
		return new DefaultBimFacade(bimService());
	}

	@Bean
	protected CardDiffer bimCardDiffer() {
		return BimCardDiffer.buildBimCardDiffer(systemDataView, lookupLogic, bimDataView());
	}

	@Bean
	protected Mapper mapper() {
		return new DefaultBimMapper(bimCardDiffer(), bimDataView());
	}

	@Bean
	protected BimDataView bimDataView() {
		return new DefaultBimDataView(systemDataView);
	}

	@Bean
	protected BimDataModelManager bimDataModelManager() {
		return new DefaultBimDataModelManager(systemDataView, dataDefinitionLogic, lookupLogic, dataSource);
	}

	@Bean
	protected BimPersistence bimDataPersistence() {
		return new DefaultBimPersistence(storeManager(), relationPersistence());
	}

	@Bean
	protected RelationPersistence relationPersistence() {
		return new DefaultRelationPersistence(systemDataView);
	}

	@Bean
	protected BimStoreManager storeManager() {
		return new DefaultBimStoreManager(projectStore(), layerStore());
	}

	@Bean
	protected Store<StorableProject> projectStore() {
		return Stores.nullOnNotFoundRead(DataViewStore.newInstance(systemDataView, storableProjectConverter()));
	}

	@Bean
	protected StorableConverter<StorableProject> storableProjectConverter() {
		return new StorableProjectConverter();
	}

	@Bean
	protected Store<StorableLayer> layerStore() {
		return Stores.nullOnNotFoundRead(DataViewStore.newInstance(systemDataView, storableLayerConverter()));
	}

	@Bean
	protected StorableConverter<StorableLayer> storableLayerConverter() {
		return new org.cmdbuild.data.converter.StorableLayerConverter();
	}

}
