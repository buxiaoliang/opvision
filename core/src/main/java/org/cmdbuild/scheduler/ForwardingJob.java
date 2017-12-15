package org.cmdbuild.scheduler;

import com.google.common.collect.ForwardingObject;

//public abstract class ForwardingJob extends ForwardingObject implements Job {
public abstract class ForwardingJob extends ForwardingObject implements JobWithTask{

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingJob() {
	}

	@Override
	protected abstract JobWithTask delegate();

	@Override
	public String getName() {
		return delegate().getName();
	}

	@Override
	public void execute() {
		delegate().execute();
	}
	
	
	protected Long taskId;
	
	public void setTaskId(Long taskId) {
		delegate().setTaskId(taskId);
	}
	
	public Long getTaskId() {
		return delegate().getTaskId();
	}

}
