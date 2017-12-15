package org.cmdbuild.logic.files;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.concurrent.ExecutionException;

import javax.activation.DataHandler;

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

//@Component
public class CachedFileSystemFacade extends ForwardingFileSystemFacade implements ClusterAwareCacheable {

	private static final Logger logger = FileLogic.logger;
	private static final Marker MARKER = MarkerFactory.getMarker(CachedFileSystemFacade.class.getName());

	private static final Object DUMMY_KEY = new Object();
	
	private final FileSystemFacade delegate;
	private final LoadingCache<Object, Collection<File>> cache;
	private ClusterMessageSender clusterMessageSender;

	public CachedFileSystemFacade(final FileSystemFacade delegate, final CacheExpiration expiration) {
		this.delegate = delegate;
		this.cache = CacheBuilder.newBuilder() //
				.expireAfterWrite(expiration.duration(), expiration.unit()) //
				.build(new CacheLoader<Object, Collection<File>>() {

					@Override
					public Collection<File> load(final Object key) throws Exception {
						return delegate.directories();
					}

				});
	}

	@Override
	protected FileSystemFacade delegate() {
		return delegate;
	}

	@Override
	public Collection<File> directories() {
		try {
			logger.info(MARKER, "getting cached values");
			return cache.get(DUMMY_KEY);
		} catch (final ExecutionException e) {
			logger.error(MARKER, "error getting cached values", e);
			return delegate.directories();
		}
	}

	@Override
	public File save(final DataHandler dataHandler, final String path) throws IOException {
		try {
			return super.save(dataHandler, path);
		} finally {
			cache.invalidateAll();
		}
	}

	@Override
	public void clearCache(CacheEvictionPolicy policy) {
		cache.invalidateAll();
		if (policy.clusterPropagation()) {
			ClusterMessage msg = new ClusterMessage(ClusterTarget.CachedFileSystemFacade.getTargetId(), ClusterEvent.CACHE_EVICT_CACHE);
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
		receiver.register(this, ClusterTarget.CachedFileSystemFacade.getTargetId());
	}

	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		clusterMessageSender = sender;
	}

	
}
