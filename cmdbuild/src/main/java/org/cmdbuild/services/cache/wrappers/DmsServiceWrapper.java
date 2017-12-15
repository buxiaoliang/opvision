package org.cmdbuild.services.cache.wrappers;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.cmdbuild.dms.DmsService;
import org.cmdbuild.services.cache.CachingService.ClusterAwareCacheable;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class DmsServiceWrapper implements ClusterAwareCacheable {
	
	private ClusterMessageSender clusterMessageSender;

	private static final Marker marker = MarkerFactory.getMarker(DmsServiceWrapper.class.getName());

	private final DmsService service;

	public DmsServiceWrapper(final DmsService service) {
		this.service = service;
	}

	@Override
	public void clearCache(CacheEvictionPolicy policy) {
		logger.info(marker, "clearing DMS cache");
		service.clearCache();
		if (policy.clusterPropagation()) {
			ClusterMessage msg = new ClusterMessage(ClusterTarget.DmsServiceWrapper.getTargetId(), ClusterEvent.CACHE_EVICT_CACHE);
			clusterMessageSender.safeSend(msg);
		}
	}
	
	@Override
	public void update(ClusterMessage msg) {
		if (ClusterEvent.CACHE_EVICT_CACHE.equals(msg.getEvent()))
			clearCache(CacheEvictionPolicy.NON_PROPAGATING);
	}

	@Override
	public void register(ClusterMessageReceiver receiver) {
		receiver.register(this, ClusterTarget.DmsServiceWrapper.getTargetId());
	}

	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		clusterMessageSender = sender;
	}

	
	

}
