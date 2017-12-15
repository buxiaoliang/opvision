package org.cmdbuild.common.cache;

public interface ClusterMessageReceiver {
	
	void register(ClusterMessageConsumer consumer, String target);

}
