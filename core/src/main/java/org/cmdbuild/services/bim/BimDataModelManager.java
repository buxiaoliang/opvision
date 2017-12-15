package org.cmdbuild.services.bim;

public interface BimDataModelManager {

	void createBimTableIfNeeded(String className);

	void deleteBimDomainIfExists(String oldClass);

	void createBimDomainOnClass(String className);

}