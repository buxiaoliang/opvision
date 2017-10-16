package org.cmdbuild.auth;

import org.cmdbuild.auth.user.OperationUser;

import com.google.common.base.Supplier;

public class UserStoreSupplier implements Supplier<OperationUser> {

	public static UserStoreSupplier of(final UserStore value) {
		return new UserStoreSupplier(value);
	}

	private final UserStore delegate;

	private UserStoreSupplier(final UserStore delegate) {
		this.delegate = delegate;
	}

	@Override
	public OperationUser get() {
		return delegate.getUser();
	}

}
