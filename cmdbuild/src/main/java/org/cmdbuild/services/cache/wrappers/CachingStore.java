package org.cmdbuild.services.cache.wrappers;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newConcurrentMap;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.cmdbuild.data.store.ForwardingStore;
import org.cmdbuild.data.store.Storable;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.services.cache.CachingService.Cacheable;
import org.cmdbuild.services.cache.CachingService.ClusterAwareCacheable;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class CachingStore<T extends Storable> extends ForwardingStore<T> implements ClusterAwareCacheable {

	private static final Marker marker = MarkerFactory.getMarker(CachingStore.class.getName());
	
	private ClusterMessageSender clusterMessageSender;

	private static class Cache<T extends Storable> {

		private final Map<String, T> cache = newConcurrentMap();
		private final Store<T> store;

		public Cache(final Store<T> store) {
			this.store = store;
		}

		private void initCacheIfEmpty() {
			if (cache.isEmpty()) {
				Cacheable.logger.info(marker, "initializing cache");
				for (final T storable : store.readAll()) {
					_add(storable);
				}
			}
		}

		public T get(final Storable storable) {
			initCacheIfEmpty();
			return cache.get(storable.getIdentifier());
		}

		public void add(final T storable) {
			initCacheIfEmpty();
			_add(storable);
		}

		private void _add(final T storable) {
			cache.put(storable.getIdentifier(), storable);
		}

		public void remove(final Storable storable) {
			initCacheIfEmpty();
			cache.remove(storable.getIdentifier());
		}

		public List<T> values() {
			initCacheIfEmpty();
			return newArrayList(cache.values());
		}

		public void clear() {
			Cacheable.logger.info(marker, "clearing cache for '{}'", store.getClass());
			cache.clear();
		}

	}

	private final Store<T> delegate;
	private final Cache<T> cache;

	public CachingStore(final Store<T> delegate) {
		this.delegate = delegate;
		this.cache = new Cache<T>(delegate);
	}

	@Override
	protected Store<T> delegate() {
		return delegate;
	}

	@Override
	public Storable create(final T storable) {
		final Storable created = super.create(storable);
		final T readed = super.read(created);
		cache.add(readed);
		return created;
	}

	@Override
	public T read(final Storable storable) {
		return cache.get(storable);
	}

	@Override
	public Collection<T> readAll() {
		return cache.values();
	}

	// TODO readAll with Groupable

	@Override
	public void update(final T storable) {
		super.update(storable);
		cache.add(storable);
	}

	@Override
	public void delete(final Storable storable) {
		super.delete(storable);
		cache.remove(storable);
	}

	@Override
	public void update(ClusterMessage msg) {
		if (ClusterEvent.CACHE_EVICT_CACHE.equals(msg.getEvent()))
			clearCache(CacheEvictionPolicy.NON_PROPAGATING);
	}

	@Override
	public void register(ClusterMessageReceiver receiver) {
		receiver.register(this, ClusterTarget.CachingStore.getTargetId());
	}

	@Override
	public void setClusterMessageSender(ClusterMessageSender sender) {
		clusterMessageSender = sender;
	}

	@Override
	public void clearCache(CacheEvictionPolicy policy) {
		cache.clear();
		if (policy.clusterPropagation()) {
			ClusterMessage msg = new ClusterMessage(ClusterTarget.CachingStore.getTargetId(), ClusterEvent.CACHE_EVICT_CACHE);
			clusterMessageSender.safeSend(msg);
		}
		
	}

	
	

}
