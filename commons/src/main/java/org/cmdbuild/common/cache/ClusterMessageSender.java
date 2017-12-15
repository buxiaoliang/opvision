package org.cmdbuild.common.cache;

public interface ClusterMessageSender {
	
	/**
	 * Sends a ClusterMessage (nearly asynchronous) to the channel, eventually raising an exception.
	 * Use if you care about failures.
	 * 
	 * @param msg a ClusterMessage. InstanceID and Timestamp are optional (filled by implementation if not found )
	 * @throws Exception
	 */
	void send(ClusterMessage msg) throws Exception;
	
	
	/**
	 * Sends a ClusterMessage (nearly asynchronous) to the channel, silently catching exceptions.
	 * Use if you do not care about failures or you do not manage them.
	 * 
	 * @param msg a ClusterMessage. InstanceID and Timestamp are optional (filled by implementation if not found )
	 */
	void safeSend(ClusterMessage msg);

}
