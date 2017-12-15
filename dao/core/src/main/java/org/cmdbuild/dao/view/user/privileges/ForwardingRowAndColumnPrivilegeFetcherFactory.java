package org.cmdbuild.dao.view.user.privileges;

import org.cmdbuild.auth.acl.PrivilegeContext;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingRowAndColumnPrivilegeFetcherFactory extends ForwardingObject
		implements RowAndColumnPrivilegeFetcherFactory {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingRowAndColumnPrivilegeFetcherFactory() {
	}

	@Override
	protected abstract RowAndColumnPrivilegeFetcherFactory delegate();

	@Override
	public RowAndColumnPrivilegeFetcher create(final PrivilegeContext privilegeContext) {
		return delegate().create(privilegeContext);
	}

}
