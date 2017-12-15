package org.cmdbuild.spring.configuration;

import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.services.Settings.DefaultSettingsClusterNotifierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Settings {

	@Autowired
	private ClusterMessageReceiver clusterMessageReceiver;
	@Autowired
	private ClusterMessageSender clusterMessageSender;

	@Bean
	public DefaultSettingsClusterNotifierService settingsClusterNotifierService() {
		DefaultSettingsClusterNotifierService settingsClusterNotifierService = new DefaultSettingsClusterNotifierService(clusterMessageSender);
		settingsClusterNotifierService.register(clusterMessageReceiver);
		return settingsClusterNotifierService;
	}

}
