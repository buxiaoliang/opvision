package org.cmdbuild.services.jgroups;

import java.util.HashMap;
import java.util.List;
//import java.util.Map;
import java.util.Map;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.logger.Log;
import org.jgroups.JChannel;
import org.jgroups.Message;
import org.jgroups.ReceiverAdapter;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

//@Component
public class JGroupsReceiver extends ReceiverAdapter implements ClusterMessageReceiver {
	
	@Autowired @Lazy JGroupsChannel channel;
	
	Logger logger = Log.CLUSTER;
	
	private Map <String, List<ClusterMessageConsumer>> register = new ConcurrentHashMap<String, List<ClusterMessageConsumer>> ();

	@Override
	public void register(ClusterMessageConsumer consumer, String target) {
		
		//TODO implement
		logger.info("JGroupsReceiver REGISTERING a consumer on Target: {} . Consumer is  {}" , target, consumer );
		List<ClusterMessageConsumer> targetConsumers = targetConsumers(target);
		if (! targetConsumers.contains(consumer))
			targetConsumers.add(consumer);
		
	}
	
	private List<ClusterMessageConsumer> targetConsumers(String target) {
		
		List<ClusterMessageConsumer> consumers = register.getOrDefault(target, null);
		if (consumers == null) {
			consumers = new Vector<ClusterMessageConsumer>();
			register.put(target, consumers);
		}
		return consumers;
		
	}

	@Override
	public void receive(Message msg) {
		
		logger.debug("JGroupsReceiver received a message: {}" ,  msg.getObject().toString());
		ClusterMessage cm = null;
		try {
			Object o = msg.getObject(); //debug , remove when done
			cm = msg.getObject();
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		if (channel.getInstanceId().equals(cm.getSenderInstanceId())) {
			logger.debug("JGroupsReceiver filtered a msg sent by same instance [{}]" , channel.getInstanceId() );
			return;
		}
		String target = cm.getTarget();
		List<ClusterMessageConsumer> notifyList = register.getOrDefault(target, null );
		if (notifyList != null) {
			for (ClusterMessageConsumer consumer : notifyList) {
				try {
					logger.debug("JGroupsReceiver is notifying consumer {} for target {}" , consumer , target);
					consumer.update(cm);
				} catch (Exception e) {
					logger.error("ClusterMessageConsumer RAISED EXCEPTION. Target was {} , Consumer : {}" ,target, consumer);
				}
			}
		} else {
			logger.warn("No consumer registered for target: {}" , cm.getTarget());
		}
		
		
	}
	
	@PostConstruct
	private void setHookOnChannel() {
		channel.getChannel().setReceiver(this);
	}
	
//	public void connect() throws Exception {
//		channel.init();
//		setHookOnChannel();
//	}

	
}
