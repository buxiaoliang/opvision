package org.cmdbuild.scheduler;

public abstract class CMDBuildSerializableJob implements JobWithTask {

	protected Long taskId;
	
	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}
	
	public Long getTaskId() {
		return taskId;
	}
	
	public static final Long EmailQueueConventionalTaskId = -100L;
	@Deprecated //internal use
	public static final String EmailQueueParameterRunning = "EmailQueueRunning";
	public static final String EmailQueueParameterLastExecution = "EmailQueueLastExecution";
	
}
