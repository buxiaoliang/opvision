package org.cmdbuild.auth.user;

import com.google.common.base.Function;

public class Functions {

	private static class Privileged<T extends CMUser> implements Function<T, Boolean> {

		private Privileged() {
		}

		@Override
		public Boolean apply(final T input) {
			return input.isPrivileged();
		};

	}

	@SuppressWarnings("rawtypes")
	private static final Privileged PRIVILEGED = new Privileged<>();

	@SuppressWarnings("unchecked")
	public static <T extends CMUser> Function<T, Boolean> privileged() {
		return PRIVILEGED;
	}

	private Functions() {
		// prevents instantiation
	}

}
