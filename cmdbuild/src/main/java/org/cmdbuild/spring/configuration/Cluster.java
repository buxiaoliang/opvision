package org.cmdbuild.spring.configuration;

import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.logger.Log;
import org.cmdbuild.services.jgroups.JGroupsReceiver;
import org.cmdbuild.services.jgroups.JGroupsSender;
import org.cmdbuild.services.jgroups.NoopClusterMessageReceiverImpl;
import org.cmdbuild.services.jgroups.NoopClusterMessageSenderImpl;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Cluster {

	private Logger logger = Log.CLUSTER;
	
	@Autowired
	private Properties properties;


	//FIXME check if really needed
	private ClusterMessageSender clusterMessageSender;
	private ClusterMessageReceiver clusterMessageReceiver;

	//FIXME manage possible JGroups initialization failure?
	@Bean
	public ClusterMessageReceiver clusterMessageReceiver() {
		if (clusterMessageReceiver == null) {
			if (properties.cmdbuildProperties().isClustered()) {
				logger.info("ClusterMessageReicever implementation: JGroupsReceiver");
				clusterMessageReceiver = new JGroupsReceiver();
			} else {
				logger.info("ClusterMessageReicever implementation: Noop");
				clusterMessageReceiver = new NoopClusterMessageReceiverImpl();
			}
		}
		return clusterMessageReceiver;
	}

	//FIXME Manage possible JGroups initialization failure?
	@Bean
	public ClusterMessageSender clusterMessageSender() {
		if (clusterMessageSender == null) {
			if (properties.cmdbuildProperties().isClustered()) {
				logger.info("ClusterMessageSender implementation: JGroupsSender");
				clusterMessageSender = new JGroupsSender();
			} else {
				logger.info("ClusterMessageSender implementation: Noop");
				clusterMessageSender = new NoopClusterMessageSenderImpl();
			}
		}
		return clusterMessageSender;
	}

}
