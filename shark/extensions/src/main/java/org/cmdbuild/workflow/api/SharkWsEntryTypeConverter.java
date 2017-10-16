package org.cmdbuild.workflow.api;

import org.cmdbuild.api.fluent.ws.EntryTypeAttribute;
import org.cmdbuild.api.fluent.ws.WsFluentApiExecutor.EntryTypeConverter;

public class SharkWsEntryTypeConverter extends SharkWsTypeConverter implements EntryTypeConverter {

	private final WorkflowApi workflowApi;
	private final Configuration configuration;

	public SharkWsEntryTypeConverter(final WorkflowApi workflowApi, final Configuration configuration) {
		this.workflowApi = workflowApi;
		this.configuration = configuration;
	}

	@Override
	protected WorkflowApi workflowApi() {
		return workflowApi;
	}

	@Override
	protected Configuration configuration() {
		return configuration;
	}

	@Override
	public String toWsType(final EntryTypeAttribute entryTypeAttribute, final Object clientValue) {
		return toWsType(workflowApi.findAttributeFor(entryTypeAttribute), clientValue);
	}

	@Override
	public Object toClientType(final EntryTypeAttribute entryTypeAttribute, final String wsValue) {
		return toClientType(workflowApi.findAttributeFor(entryTypeAttribute), wsValue);
	}

}
