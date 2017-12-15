package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;
import static org.cmdbuild.spring.util.Constants.SYSTEM;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.dao.view.DBDataView;
import org.cmdbuild.data.store.dao.DataViewStore;
import org.cmdbuild.data.store.dao.StorableConverter;
import org.cmdbuild.data.store.lookup.DataViewLookupStore;
import org.cmdbuild.data.store.lookup.Lookup;
import org.cmdbuild.data.store.lookup.LookupStorableConverter;
import org.cmdbuild.data.store.lookup.LookupStore;
import org.cmdbuild.logic.data.DataDefinitionLogic;
import org.cmdbuild.logic.data.DefaultDataDefinitionLogic;
import org.cmdbuild.logic.data.UserDataDefinitionLogic;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.DefaultDataAccessLogic;
import org.cmdbuild.logic.data.access.PrivilegedDataAccessLogic;
import org.cmdbuild.logic.data.access.SystemDataAccessLogic;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.logic.privileges.DefaultSecurityLogic;
import org.cmdbuild.logic.privileges.SecurityLogic;
import org.cmdbuild.services.cache.wrappers.CachingStore;
import org.cmdbuild.services.errors.management.CustomExceptionHandlerDataView;
import org.cmdbuild.services.localization.LocalizedDataView;
import org.cmdbuild.services.localization.LocalizedStorableConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;

@Configuration
public class Data {

	@Autowired
	private Authentication authentication;

	@Autowired
	private CustomPages customPages;

	@Autowired
	private DBDriver dbDriver;

	@Autowired
	private Filter filter;

	@Autowired
	private Lock lock;

	@Autowired
	private Report report;

	@Autowired
	private Translation translation;

	@Autowired
	private UserStore userStore;

	@Autowired
	private View view;
	
	//FIXME dino
	@Autowired ClusterMessageReceiver clusterMessageReceiver;
	@Autowired ClusterMessageSender clusterMessageSender;

	@Bean
	protected StorableConverter<Lookup> lookupStorableConverter() {
		return new LocalizedStorableConverter<Lookup>(new LookupStorableConverter(), translation.translationFacade(),
				dbDataView(), report.reportLogic());
	}

	@Bean
	protected DataViewStore<Lookup> baseLookupStore() {
		return DataViewStore.<Lookup> newInstance() //
				.withDataView(dbDataView()) //
				.withStorableConverter(lookupStorableConverter()) //
				.build();
	}

	@Bean
	public CachingStore<Lookup> cachedLookupStore() {
		CachingStore<Lookup> cachingStore = new CachingStore<Lookup>(baseLookupStore());
		cachingStore.setClusterMessageSender(clusterMessageSender);
		cachingStore.register(clusterMessageReceiver);
		return cachingStore;
	}

	@Bean
	public LookupStore lookupStore() {
		return new DataViewLookupStore(cachedLookupStore());
	}

	@Bean
	@Scope(PROTOTYPE)
	public DataDefinitionLogic dataDefinitionLogic() {
		return new DefaultDataDefinitionLogic(systemDataView());
	}

	@Bean
	@Scope(PROTOTYPE)
	public UserDataDefinitionLogic userDataDefinitionLogic() {
		return new UserDataDefinitionLogic(dataDefinitionLogic(), systemDataView());
	}

	@Bean
	@Scope(PROTOTYPE)
	public LookupLogic lookupLogic() {
		return new LookupLogic(lookupStore(), userStore.getUser(), systemDataView());
	}

	@Bean
	@Scope(PROTOTYPE)
	public SecurityLogic securityLogic() {
		return new DefaultSecurityLogic(systemDataView(), view.viewConverter(), filter.dataViewFilterStore(),
				customPages.defaultCustomPagesLogic());
	}

	@Bean(name = SystemDataAccessLogic.BEAN)
	@Scope(PROTOTYPE)
	public DataAccessLogic systemDataAccessLogic() {
		final OperationUser user = userStore.getUser();
		final DataAccessLogic _delegate = new DefaultDataAccessLogic(systemDataView(), lookupStore(), systemDataView(),
				user, lock.dummyLockLogic(), authentication.standardSessionLogic());
		final DataAccessLogic delegate = new PrivilegedDataAccessLogic(_delegate, user.getPrivilegeContext());
		return new SystemDataAccessLogic(delegate);
	}

	public static final String BEAN_SYSTEM_DATA_VIEW = "systemDataView";

	@Bean(name = BEAN_SYSTEM_DATA_VIEW)
	@Qualifier(SYSTEM)
	public CMDataView systemDataView() {
		return customExceptionHandlerDataView();
	}

	@Bean
	protected CMDataView customExceptionHandlerDataView() {
		return new CustomExceptionHandlerDataView(localizedDataView());
	}

	@Bean
	protected CMDataView localizedDataView() {
		return new LocalizedDataView( //
				dbDataView(), //
				translation.translationFacade(), //
				lookupStore());
	}

	@Bean
	protected CMDataView dbDataView() {
		return new DBDataView(dbDriver);
	}

}
