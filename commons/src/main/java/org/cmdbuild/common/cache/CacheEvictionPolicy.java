package org.cmdbuild.common.cache;

public enum CacheEvictionPolicy {
	
	CLUSTER_PROPAGATION (true) ,
	NON_PROPAGATING (false) ,
//	InstanceGeneratedEvictionRequestPolicy (true) ,
//	ClusterGeneratedEvictionRequestPolicy (false) ,
	;

	CacheEvictionPolicy(boolean clusterPropagation) {
		this.clusterPropagation =clusterPropagation;
	}
	
	boolean clusterPropagation;
	
	public boolean clusterPropagation() {
		return clusterPropagation;
	}

}
