package org.cmdbuild.services.cache;

import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageProducer;
import org.cmdbuild.logger.Log;
import org.slf4j.Logger;

public interface CachingService {

	Logger logger = Log.CMDBUILD;

	interface Cacheable {

		Logger logger = CachingService.logger;

		void clearCache(CacheEvictionPolicy policy);

	}
	
	interface ClusterAwareCacheable extends Cacheable , ClusterMessageConsumer  , ClusterMessageProducer {
		
	}

	/**
	 * only in-instance eviction calls
	 */
	void clearCache();
	
}
