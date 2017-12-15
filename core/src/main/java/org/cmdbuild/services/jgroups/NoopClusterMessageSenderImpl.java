package org.cmdbuild.services.jgroups;

import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.logger.Log;
import org.slf4j.Logger;

public class NoopClusterMessageSenderImpl implements ClusterMessageSender {

	private Logger logger = Log.CLUSTER;

	@Override
	public void send(ClusterMessage msg) throws Exception {
		logger.trace("NoopClusterMessegeSenderReceiverImpl SEND invoked. Msg is: {}", msg);
	}

	@Override
	public void safeSend(ClusterMessage msg) {
		logger.trace("NoopClusterMessegeSenderReceiverImpl SAFESEND invoked. Msg is: {}", msg);
	}

}
