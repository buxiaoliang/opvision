package org.cmdbuild.services.jgroups;



import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.logger.Log;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

//@Component
public class JGroupsSender implements ClusterMessageSender {
	
	
	@Autowired @Lazy JGroupsChannel channel;

	Logger logger = Log.CLUSTER;
	
	@Override
	public void send(ClusterMessage msg) throws Exception {
		channel.send(msg);
		logger.debug("JGroupsSender [{}] is sending message {}" , channel.getInstanceId(), msg);
	}

	@Override
	public void safeSend(ClusterMessage msg) {
		
		try {
			send(msg);
		} catch (Exception e) {
			logger.error("JGroupsSender (Async Send) COULD NOT SEND CLUSTER MESSAGE {} because of {}" , msg, e.toString());
		}
		
	}
	
	public void connect() throws Exception {
		channel.init();
	}
	
}
