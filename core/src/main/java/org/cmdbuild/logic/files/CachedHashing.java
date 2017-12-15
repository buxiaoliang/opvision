package org.cmdbuild.logic.files;

import java.util.concurrent.ExecutionException;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.cmdbuild.services.cache.CachingService.ClusterAwareCacheable;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

public class CachedHashing implements Hashing, ClusterAwareCacheable {

	private static final Logger logger = FileLogic.logger;
	private static final Marker MARKER = MarkerFactory.getMarker(CachedHashing.class.getName());

	private final Hashing delegate;
	private final LoadingCache<String, String> cache;
	
	private ClusterMessageSender clusterMessageSender;

	public CachedHashing(final Hashing delegate, final CacheExpiration expiration) {
		this.delegate = delegate;
		this.cache = CacheBuilder.newBuilder() //
				.expireAfterWrite(expiration.duration(), expiration.unit()) //
				.build(new CacheLoader<String, String>() {

					@Override
					public String load(final String key) throws Exception {
						return delegate.hash(key);
					}

				});
	}

	@Override
	public String hash(final String value) {
		try {
			logger.info(MARKER, "getting cached value for '{}'", value);
			return cache.get(value);
		} catch (final ExecutionException e) {
			logger.error(MARKER, "error getting cached value", e);
			return delegate.hash(value);
		}
	}

	@Override
	public void clearCache(CacheEvictionPolicy policy) {
		logger.info(MARKER, "clearing cache");
		cache.invalidateAll();
		if (policy.clusterPropagation()) {
			ClusterMessage msg = new ClusterMessage(ClusterTarget.CachedHashing.getTargetId(), ClusterEvent.CACHE_EVICT_CACHE);
			clusterMessageSender.safeSend(msg);
		}
	}
	
	@Override
	public void update(ClusterMessage msg) {
		if (ClusterEvent.CACHE_EVICT_CACHE.equals(msg.getEvent()))
			cache.invalidateAll();
	}

	@Override
	public void register(ClusterMessageReceiver receiver) {
		receiver.register(this, ClusterTarget.CachedHashing.getTargetId());
	}

	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		clusterMessageSender = sender;
	}

}

