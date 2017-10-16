package org.cmdbuild.workflow.user;

public class UserProcessInstanceWithPosition extends ForwardingUserProcessInstance {

	private final UserProcessInstance delegate;
	private final Long position;

	public UserProcessInstanceWithPosition(final UserProcessInstance delegate, final Long position) {
		this.delegate = delegate;
		this.position = position;
	}

	@Override
	protected UserProcessInstance delegate() {
		return delegate;
	}

	public Long getPosition() {
		return position;
	}

}
