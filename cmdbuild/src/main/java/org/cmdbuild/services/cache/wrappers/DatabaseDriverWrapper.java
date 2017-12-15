package org.cmdbuild.services.cache.wrappers;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.cmdbuild.dao.driver.AbstractDBDriver;
import org.cmdbuild.services.cache.CachingService.ClusterAwareCacheable;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class DatabaseDriverWrapper implements ClusterAwareCacheable {

	private static final Marker marker = MarkerFactory.getMarker(DatabaseDriverWrapper.class.getName());

	private final AbstractDBDriver driver;
	private ClusterMessageSender clusterMessageSender;

	public DatabaseDriverWrapper(final AbstractDBDriver driver) {
		this.driver = driver;
	}

	@Override
	public void clearCache(CacheEvictionPolicy policy) {
		logger.info(marker, "clearing database driver cache");
		driver.clearCache(policy);
		if (policy.clusterPropagation()) {
			ClusterMessage msg = new ClusterMessage(ClusterTarget.DatabaseDriverWrapper.getTargetId(), ClusterEvent.CACHE_EVICT_CACHE);
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
		receiver.register(this, ClusterTarget.DatabaseDriverWrapper.getTargetId());
	}

	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		clusterMessageSender = sender;
		driver.setClusterMessageSender(sender);
	}


}
