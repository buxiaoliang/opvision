package org.cmdbuild.workflow.api;

public class SynchronizedSchemaApi extends ForwardingSchemaApi {

	private final SchemaApi delegate;

	public SynchronizedSchemaApi(final SchemaApi delegate) {
		this.delegate = delegate;
	}

	@Override
	protected SchemaApi delegate() {
		synchronized (delegate) {
			return delegate;
		}
	}

}
