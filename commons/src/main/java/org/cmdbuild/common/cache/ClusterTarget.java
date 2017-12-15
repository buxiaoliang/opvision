package org.cmdbuild.common.cache;

public enum ClusterTarget {
	
	CachingService("CachingService") ,
	CachedFileSystemFacade("CachedFileSystemFacade") ,
	CachedHashing("CachedHashing") ,
	TranslationServiceWrapper("TranslationServiceWrapper") ,
	NotSystemUserFetcher("NotSystemUserFetcher") ,
	JSONDispatcherServiceWrapper("JSONDispatcherServiceWrapper") ,
	DmsServiceWrapper("DmsServiceWrapper") ,
	DatabaseDriverWrapper("DatabaseDriverWrapper") , //possibly never used (TypeObjectCache called instead)
	CachingStore("CachingStore") ,
	TypeObjectCache("TypeObjectCache") ,
	WorkflowEventManager("WorkflowEventManager") ,
	SettingsService("SettingsService") ,
	;
	
	ClusterTarget(String targetId) {
		this.targetId = targetId;
	}
	
	private final String targetId;
	
	public String getTargetId() {
		return targetId;
	}

}
