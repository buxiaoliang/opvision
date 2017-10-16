package org.cmdbuild.logic.data;

import static org.cmdbuild.exception.AuthException.AuthExceptionType.AUTH_CLASS_NOT_AUTHORIZED;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.model.data.Attribute;
import org.cmdbuild.model.data.EntryType;

public class UserDataDefinitionLogic extends ForwardingDataDefinitionLogic {

	private final DataDefinitionLogic delegate;
	private final CMDataView dataView;

	public UserDataDefinitionLogic(final DataDefinitionLogic delegate, final CMDataView dataView) {
		this.delegate = delegate;
		this.dataView = dataView;
	}

	@Override
	protected DataDefinitionLogic delegate() {
		return delegate;
	}

	@Override
	public CMClass createOrUpdate(final EntryType entryType, final boolean forceCreation) {
		if (entryType.isSystem()) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(entryType.getName());
		}
		if (!forceCreation) {
			final CMClass found = dataView.findClass(entryType.getName());
			if (found != null && found.isSystem()) {
				throw AUTH_CLASS_NOT_AUTHORIZED.createException(entryType.getName());
			}
		}
		return delegate().createOrUpdate(entryType, forceCreation);
	}

	@Override
	public void deleteOrDeactivate(final String className) {
		final CMClass found = dataView.findClass(className);
		if (found != null && found.isSystem()) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(className);
		}
		delegate().deleteOrDeactivate(className);
	}

	@Override
	public CMAttribute createOrUpdate(final Attribute attribute) {
		final CMEntryType found = findOwnerOf(attribute);
		if (found != null && found.isSystem()) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(attribute.getOwnerName());
		}
		return delegate().createOrUpdate(attribute);
	}

	@Override
	public void deleteOrDeactivate(final Attribute attribute) {
		final CMEntryType found = findOwnerOf(attribute);
		if (found != null && found.isSystem()) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(attribute.getOwnerName());
		}
		delegate().deleteOrDeactivate(attribute);
	}

}
