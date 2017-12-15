package org.cmdbuild.dao;
import org.cmdbuild.common.cache.CacheEvictionPolicy;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageProducer;

public interface ClusterAwareTypeObjectCache  extends TypeObjectCache , ClusterMessageConsumer , ClusterMessageProducer {

	void clear(CacheEvictionPolicy policy);
}
