package org.cmdbuild.common.cache;

public interface ClusterMessageConsumer {
	
	void update(ClusterMessage msg);
	
	void register(ClusterMessageReceiver receiver);

}
