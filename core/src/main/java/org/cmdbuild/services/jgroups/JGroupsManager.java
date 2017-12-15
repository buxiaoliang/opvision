package org.cmdbuild.services.jgroups;


import org.cmdbuild.logger.Log;
import org.jgroups.*;
import org.jgroups.protocols.FD;
import org.jgroups.protocols.FRAG2;
import org.jgroups.protocols.MERGE3;
import org.jgroups.protocols.NAMING;
import org.jgroups.protocols.PING;
import org.jgroups.protocols.SEQUENCER;
import org.jgroups.protocols.UDP;
import org.jgroups.protocols.pbcast.NAKACK2;
import org.jgroups.stack.Protocol;
import org.slf4j.Logger;

import java.io.File;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Random;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Lazy
@Component
@EnableScheduling
@Deprecated // initial testing purpose only
public class JGroupsManager extends ReceiverAdapter {
	
	protected JChannel channel;
	
	protected Logger logger = Log.CLUSTER;
	
	
	
	@Override
	public void receive(Message msg) {
		logger.info("JGroupsManager instance: {} received a message. Content is:  {}" , trivialInstanceId,  msg.getObject().toString());
	}
	
	public void sendMessage(Message msg) throws Exception {
		logger.info("JGroupsManager about to send a message. Content is:  {}" , msg.getObject().toString());
		channel.send(msg);
	}
	
	public void sendMessage(String message) {
		Message msg = new Message(null,message);
//		msg.setBuffer(message.getBytes());
		try {
			sendMessage(msg);
		} catch (Exception e) {
			logger.error("JGroupsManager COULD NOT SEND string msg {}" , msg);
			e.printStackTrace();
			logger.error(e.toString());
		}
	}
	
	@PostConstruct
	public void init() throws Exception {
		//TODO create channel
		
		channel= getTestConfiguredChannel();
		
     
        channel.name("CMDBuild-Cache");//??? connect?
        channel.setReceiver(this);
        channel.connect("CMDBuild-Cache");
	}

	@PreDestroy
	public void dispose() {
		
		//TODO check if flush is wanted
		if (channel != null)
			channel.close(); //disconnects from cluster and disposes it
		
	}
	
	protected JChannel getTestConfiguredChannel() throws Exception {
		
		
		Protocol[] stack = {
				new UDP() //.setBindAddress(Inet4Address.getLoopbackAddress())
				, new PING()
				, new MERGE3()
//				, new FD()
//				, new NAKACK2() //TODO: if enabled no message is exchanged (single host two instance environment: check if NAMING is needed
				, new FRAG2()
//				, new SEQUENCER()
//				, new NAMING()
		};
		List<Protocol> protocols = new ArrayList<>(Arrays.asList(stack));
		JChannel channel = new JChannel(protocols);
		return channel;
	}
	
	//@Scheduled(initialDelay = 15000 , fixedDelay = 20000)
	public void testSendMessage() {
		String message = "Hello from " + trivialInstanceId + " @ " + LocalDateTime.now().toString();
		sendMessage(message);
	}
	
	protected String trivialInstanceId = "InstanceID: " + (new Date()).getTime() % 1000000L; 
}
