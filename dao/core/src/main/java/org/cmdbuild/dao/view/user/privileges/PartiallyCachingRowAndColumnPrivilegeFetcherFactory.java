package org.cmdbuild.dao.view.user.privileges;

import static com.google.common.base.Preconditions.checkNotNull;
import org.cmdbuild.auth.acl.PrivilegeContext;

public class PartiallyCachingRowAndColumnPrivilegeFetcherFactory extends ForwardingRowAndColumnPrivilegeFetcherFactory {

	private final RowAndColumnPrivilegeFetcherFactory delegate;

	public PartiallyCachingRowAndColumnPrivilegeFetcherFactory(final RowAndColumnPrivilegeFetcherFactory delegate) {
		checkNotNull(delegate);
		this.delegate = delegate;
	}

	@Override
	protected RowAndColumnPrivilegeFetcherFactory delegate() {
		return delegate;
	}

	@Override
	public RowAndColumnPrivilegeFetcher create(final PrivilegeContext privilegeContext) {
		return new PartiallyCachingRowAndColumnPrivilegeFetcher(super.create(privilegeContext));
	}

}
