package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;
import static org.cmdbuild.spring.util.Constants.SOAP;

import org.cmdbuild.auth.NotSystemUserFetcher;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.dao.driver.AbstractDBDriver;
import org.cmdbuild.dms.DmsService;
import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.cache.CachingLogic;
import org.cmdbuild.logic.cache.DefaultCachingLogic;
import org.cmdbuild.services.cache.CachingService;
import org.cmdbuild.services.cache.CachingService.Cacheable;
import org.cmdbuild.services.cache.DefaultCachingService;
import org.cmdbuild.services.cache.wrappers.DatabaseDriverWrapper;
import org.cmdbuild.services.cache.wrappers.DmsServiceWrapper;
import org.cmdbuild.services.cache.wrappers.JSONDispatcherServiceWrapper;
import org.cmdbuild.services.cache.wrappers.TranslationServiceWrapper;
import org.cmdbuild.services.jgroups.JGroupsChannel;
import org.cmdbuild.services.jgroups.JGroupsReceiver;
import org.cmdbuild.services.jgroups.JGroupsSender;
import org.cmdbuild.services.jgroups.NoopClusterMessageReceiverImpl;
import org.cmdbuild.services.jgroups.NoopClusterMessageSenderImpl;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;

import java.util.Arrays;

@Configuration
public class Cache {

	@Autowired
	private Data data;

	@Autowired
	private AbstractDBDriver driver;

	@Autowired
	private DmsService dmsService;

	@Autowired
	private Files files;

	@Autowired
	@Qualifier(SOAP)
	private NotSystemUserFetcher notSystemUserFetcher;
	
	@Autowired  ClusterMessageReceiver clusterMessageReceiver;
	@Autowired  ClusterMessageSender clusterMessageSender;

	private Logger logger = Log.CMDBUILD;
	
	@Bean
	public CachingService cachingService()  {
		
		notSystemUserFetcher.setClusterMessageSender(clusterMessageSender());
		notSystemUserFetcher.register(clusterMessageReceiver());
		
		DefaultCachingService defaultCachingService = new DefaultCachingService(Arrays.asList( //
				databaseDriverWrapper(), //
				dmsServiceWrapper(), //
				data.cachedLookupStore(), //
				translationServiceWrapper(), //
				jsonDispatcherServiceWrapper(), //
				notSystemUserFetcher, //
				files.cachedFileSystemFacade(), //
				files.cachedHashing()));
		
		try {
			defaultCachingService.register(clusterMessageReceiver());
			defaultCachingService.setClusterMessageSender(clusterMessageSender());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			logger.error("SEVERE DEFAULT CACHING SERVER COULD NOT REGISTER RECEIVER OR SENDER, because of: " + e.toString());
		}
		
		return defaultCachingService;
	}

	@Bean
	protected Cacheable databaseDriverWrapper() {
		
		driver.setClusterMessageSender(clusterMessageSender());
		driver.setClusterMessageReceiver(clusterMessageReceiver());
		return new DatabaseDriverWrapper(driver);
	}

	@Bean
	protected Cacheable dmsServiceWrapper() {
		DmsServiceWrapper wrapper = new DmsServiceWrapper(dmsService);
		wrapper.setClusterMessageSender(clusterMessageSender());
		wrapper.register(clusterMessageReceiver());
		return wrapper;
	}

	@Bean
	protected Cacheable translationServiceWrapper() {
		TranslationServiceWrapper wrapper = new TranslationServiceWrapper();
		wrapper.setClusterMessageSender(clusterMessageSender());
		wrapper.register(clusterMessageReceiver());
		return wrapper;
	}

	@Bean
	protected Cacheable jsonDispatcherServiceWrapper() {
		JSONDispatcherServiceWrapper wrapper = new JSONDispatcherServiceWrapper();
		wrapper.setClusterMessageSender(clusterMessageSender());
		wrapper.register(clusterMessageReceiver());
		return wrapper;
	}

	@Bean
	@Scope(PROTOTYPE)
	// FIXME why prototype?
	public CachingLogic defaultCachingLogic() {
		return new DefaultCachingLogic(cachingService());
	}
	
	private ClusterMessageReceiver clusterMessageReceiver() {
		return clusterMessageReceiver;
	}
	
	private ClusterMessageSender clusterMessageSender() {
		return clusterMessageSender;
	}
	
	
}
