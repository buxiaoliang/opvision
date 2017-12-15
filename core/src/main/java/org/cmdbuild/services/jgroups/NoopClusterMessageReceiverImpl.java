package org.cmdbuild.services.jgroups;

import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.logger.Log;
import org.slf4j.Logger;

public class NoopClusterMessageReceiverImpl implements ClusterMessageReceiver {

	Logger logger =Log.CLUSTER;
	@Override
	public void register(ClusterMessageConsumer consumer, String target) {
		logger.info("NoopClusterMessegeSenderReceiverImpl REGISTER invoked. Target: {} , Conusmer : {}" , target, consumer );

	}

}
