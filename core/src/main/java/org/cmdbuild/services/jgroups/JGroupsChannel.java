package org.cmdbuild.services.jgroups;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.logger.Log;
import org.jgroups.JChannel;
import org.jgroups.Message;
import org.jgroups.Message.Flag;
import org.jgroups.protocols.FRAG2;
import org.jgroups.protocols.MERGE3;
import org.jgroups.protocols.PING;
import org.jgroups.protocols.UDP;
import org.jgroups.stack.Protocol;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
@Lazy
public class JGroupsChannel {

	// @Autowired private static ApplicationContext applicationContext;
	@Autowired
	ResourceLoader resourceLoader;

	protected JChannel channel;

	protected String instanceId = "JChannel Node " + new Date().getTime();

	protected String jChannelId = "CMDBuild-Cache";

	protected Logger logger = Log.CLUSTER;

	@PostConstruct
	public synchronized void init() throws Exception {

		channel = getConfiguredChannel();
		// channel= getFallBackChannel(); //local debug purpose
		channel.connect(jChannelId);
		logger.info("JGroupsChannel: INSTANCE ID IS:" + instanceId);
	}

	@PreDestroy
	public void dispose() {

		// TODO check if flush is wanted
		if (channel != null)
			channel.close(); // disconnects from cluster and disposes it

	}

	/**
	 * @return minimal a standard UDP multicast JChanell with minimal configuration
	 * @throws Exception
	 */
	protected JChannel getFallBackChannel() throws Exception {

		Protocol[] stack = { new UDP() // .setBindAddress(Inet4Address.getLoopbackAddress())
				, new PING(), new MERGE3()
				// , new FD()
				// , new NAKACK2() //TODO: if enabled no message is exchanged (single host two
				// instance environment: check if NAMING is needed
				, new FRAG2()
				// , new SEQUENCER()
				// , new NAMING()
		};
		List<Protocol> protocols = new ArrayList<>(Arrays.asList(stack));
		JChannel channel = new JChannel(protocols);
		instanceId = "JChannel Node " + new Date().getTime(); // for debug purpose
		return channel;
	}

	/**
	 * 
	 * @return a JChannel built according to external configuration or a standard
	 *         UDP fallback channel
	 * @throws Exception
	 *             TODO failure behaviour has to be decided, yet
	 */
	protected JChannel getConfiguredChannel() throws Exception {

		try {
			// Resource jGroupsConfigResource =
			// SpringIntegrationUtils.applicationContext().getResource("WEB-INF/conf/jgroups.xml");
			Resource jGroupsConfigResource = resourceLoader.getResource("WEB-INF/conf/jgroups.xml");
			// Resource jGroupsConfigResource =
			// applicationContext.getResource("WEB-INF/conf/jgroups.xml");

			logger.info("JGroups config exists: ", jGroupsConfigResource.exists());
			if (jGroupsConfigResource.exists()) {
				logger.info("Configuring JGroupsChannel with: {}   ... ",
						jGroupsConfigResource.getFile().getAbsolutePath());
				JChannel channel = new JChannel(jGroupsConfigResource.getInputStream());
				return channel;
			}
		} catch (Exception e) {
			// TODO Implement some failure logic according to CMDBUILD conventions
			logger.error(
					"SEVERE: invalid JGroups configuration, fallback to default minimal UDP local configuration! Cause: "
							+ e.toString());
		}
		return getFallBackChannel();

	}

	public JChannel getChannel() {
		return channel;
	}

	public void send(ClusterMessage clusterMessage) throws Exception {
		clusterMessage.setSenderInstanceId(instanceId);
		if (clusterMessage.getTimestamp() == null) {
			clusterMessage.setTimestamp(LocalDateTime.now());
		}
		Message message = new Message(null, clusterMessage);
		if (clusterMessage.getRequireRsvp() == true) {
			message.setFlag(Flag.RSVP);
		}
		channel.send(message);
	}

	public String getInstanceId() {
		return instanceId;
	}

}
