package org.cmdbuild.logic.data;

import java.util.List;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.model.data.Attribute;
import org.cmdbuild.model.data.ClassOrder;
import org.cmdbuild.model.data.Domain;
import org.cmdbuild.model.data.EntryType;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingDataDefinitionLogic extends ForwardingObject implements DataDefinitionLogic {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingDataDefinitionLogic() {
	}

	@Override
	protected abstract DataDefinitionLogic delegate();

	@Override
	public CMDataView getView() {
		return delegate().getView();
	}

	@Override
	public CMClass createOrUpdate(final EntryType entryType, final boolean forceCreation) {
		return delegate().createOrUpdate(entryType, forceCreation);
	}

	@Override
	public CMClass createOrUpdate(final EntryType entryType) {
		return delegate().createOrUpdate(entryType);
	}

	@Override
	public void deleteOrDeactivate(final String className) {
		delegate().deleteOrDeactivate(className);
	}

	@Override
	public CMEntryType findOwnerOf(final Attribute attribute) {
		return delegate().findOwnerOf(attribute);
	}

	@Override
	public CMAttribute createOrUpdate(final Attribute attribute) {
		return delegate().createOrUpdate(attribute);
	}

	@Override
	public void deleteOrDeactivate(final Attribute attribute) {
		delegate().deleteOrDeactivate(attribute);
	}

	@Override
	public void reorder(final Attribute attribute) {
		delegate().reorder(attribute);
	}

	@Override
	public void changeClassOrders(final String className, final List<ClassOrder> classOrders) {
		delegate().changeClassOrders(className, classOrders);
	}

	@Override
	public CMDomain create(final Domain domain) {
		return delegate().create(domain);
	}

	@Override
	public CMDomain update(final Domain domain) {
		return delegate().update(domain);
	}

	@Override
	public void deleteDomainIfExists(final String name) {
		delegate().deleteDomainIfExists(name);
	}

	@Override
	public Iterable<FunctionItem> functions() {
		return delegate().functions();
	}

}
