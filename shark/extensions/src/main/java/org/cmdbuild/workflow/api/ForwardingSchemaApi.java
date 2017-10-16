package org.cmdbuild.workflow.api;

import org.cmdbuild.api.fluent.ws.EntryTypeAttribute;
import org.cmdbuild.workflow.type.LookupType;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingSchemaApi extends ForwardingObject implements SchemaApi {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingSchemaApi() {
	}

	@Override
	protected abstract SchemaApi delegate();

	@Override
	public ClassInfo findClass(final String className) {
		return delegate().findClass(className);
	}

	@Override
	public ClassInfo findClass(final int classId) {
		return delegate().findClass(classId);
	}

	@Override
	public AttributeInfo findAttributeFor(final EntryTypeAttribute entryTypeAttribute) {
		return delegate().findAttributeFor(entryTypeAttribute);
	}

	@Override
	public LookupType selectLookupById(final int id) {
		return delegate().selectLookupById(id);
	}

	@Override
	public LookupType selectLookupByCode(final String type, final String code) {
		return delegate().selectLookupByCode(type, code);
	}

	@Override
	public LookupType selectLookupByDescription(final String type, final String description) {
		return delegate().selectLookupByDescription(type, description);
	}

}
