package org.cmdbuild.common.cache;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ClusterMessage implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	private String senderInstanceId;
	private LocalDateTime timestamp;
	private String target;
	
	private ClusterEvent event; //TODO force default to non null? NOOP?
	private List<String> params; //TODO should be changed to  Serializable after first functional tests
	private transient boolean requireRsvp = false; // rsvp = set Message.RSVP flag in jgroups
	/**
	 * Message.RSVP flag: when this flag is encountered, the message send blocks
	 * until all members have acknowledged reception of the message (of course
	 * excluding members which crashed or left meanwhile).
	 *
	 * This also serves as another purpose: if we send an RSVP-tagged message,
	 * then - when the send() returns - we’re guaranteed that all messages sent
	 * before will have been delivered at all members as well. So, for example,
	 * if P sends message 1-10, and marks 10 as RSVP, then, upon JChannel.send()
	 * returning, P will know that all members received messages 1-10 from P.
	 *
	 * Note that since RSVP’ing a message is costly, and might block the sender
	 * for a while, it should be used sparingly. For example, when completing a
	 * unit of work (ie. member P sending N messages), and P needs to know that
	 * all messages were received by everyone, then RSVP could be used.
	 */
	
	
	public ClusterMessage() { this.setTimestamp(LocalDateTime.now());}
	
	public ClusterMessage(String target, ClusterEvent event, List<String> params) {
		this();
		this.target = target;
		this.event = event;
		this.params = params;
	}
	
	public ClusterMessage(String target, ClusterEvent event, String... params) {
		this(target, event, Arrays.asList(params));
	}
	
	@Override
	public String toString() {
		StringBuilder msg = new StringBuilder("ClusterMessage: ");
		msg.append(" InstanceId: ").append(getSenderInstanceId());
		msg.append(" Timestamp: ").append(getTimestamp());
		msg.append(" Target: ").append(getTarget());
		msg.append(" Event: ").append(getEvent());
		msg.append(" Params: ").append(getParams());
		return msg.toString();
	}

	public boolean getRequireRsvp() {
		return requireRsvp;
	}

	public void setRequireRsvp(boolean requireRsvp) {
		this.requireRsvp = requireRsvp;
	}
	
	public ClusterMessage withRequireRsvp(boolean requireRsvp) {
		setRequireRsvp(requireRsvp);
		return this;
	}
	
	public String getSenderInstanceId() {
		return senderInstanceId;
	}
	public void setSenderInstanceId(String senderInstanceId) {
		this.senderInstanceId = senderInstanceId;
	}
	public LocalDateTime getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
	public ClusterEvent getEvent() {
		return event;
	}
	public void setEvent(ClusterEvent command) {
		this.event = command;
	}
	public List<String> getParams() {
		return params;
	}
	public void setParams(List<String> params) {
		this.params = params;
	}
	public String getTarget() {
		return target;
	}
	public void setTarget(String target) {
		this.target = target;
	}
	
	
	
	

}
