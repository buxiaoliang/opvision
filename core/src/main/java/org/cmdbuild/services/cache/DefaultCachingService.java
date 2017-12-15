package org.cmdbuild.services.cache;

import java.util.List;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageProducer;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import com.google.common.collect.Lists;


public class DefaultCachingService implements CachingService, ClusterMessageConsumer , ClusterMessageProducer  {

	private static final Marker marker = MarkerFactory.getMarker(DefaultCachingService.class.getName());

	private final List<Cacheable> cacheables = Lists.newArrayList();
	
	private ClusterMessageSender clusterSender;
//	private ClusterMessageReceiver clusterReceiver; not needed

	public DefaultCachingService(final Iterable<Cacheable> cacheables) {
		for (final Cacheable cacheable : cacheables) {
			if (cacheable != null) //FIXME detected 2 nulls!
				this.cacheables.add(cacheable);
		}
	}
	
	@Override
	public void clearCache() {
		
		doClearCache(CacheEvictionPolicy.NON_PROPAGATING);
		
		ClusterMessage msg = new ClusterMessage(ClusterTarget.CachingService.getTargetId(), ClusterEvent.CACHE_EVICT_ALL_CACHES);
		try {
			clusterSender.send(msg); //send is used instead of asyncSafeSend
		} catch (Exception e) {
			logger.error("DefaultCachingService could not propagate cluster event: EVICT ALL CACHES because of {}" , e.toString());
		}
	}

	@Override
	public void update(ClusterMessage msg) {
		
		if (ClusterEvent.CACHE_EVICT_ALL_CACHES.equals(msg.getEvent()))
				doClearCache(CacheEvictionPolicy.NON_PROPAGATING);
	}
	
	protected void doClearCache(CacheEvictionPolicy policy) {
		
		for (final Cacheable cacheable : cacheables) {
			logger.debug(marker, "clearing cache for '{}'", cacheable.getClass());
			cacheable.clearCache(policy);
		}
	}
	
	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		this.clusterSender = sender;
	}

	@Override
	public void register(ClusterMessageReceiver receiver) {
		receiver.register(this, ClusterTarget.CachingService.getTargetId());
//		this.clusterReceiver = receiver; //TODO not needed
	}
	
}