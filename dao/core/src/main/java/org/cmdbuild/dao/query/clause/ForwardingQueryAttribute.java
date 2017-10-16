package org.cmdbuild.dao.query.clause;

import org.cmdbuild.dao.query.clause.alias.Alias;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingQueryAttribute extends ForwardingObject implements QueryAttribute {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingQueryAttribute() {
	}

	@Override
	protected abstract QueryAttribute delegate();

	@Override
	public Alias getAlias() {
		return delegate().getAlias();
	}

	@Override
	public String getName() {
		return delegate().getName();
	};

}
