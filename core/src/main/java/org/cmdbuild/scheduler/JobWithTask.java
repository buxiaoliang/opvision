package org.cmdbuild.scheduler;

public interface JobWithTask extends Job {
	
	void setTaskId(Long taskId);
	
	Long getTaskId();
	
}
