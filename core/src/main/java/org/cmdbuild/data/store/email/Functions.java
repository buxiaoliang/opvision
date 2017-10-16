package org.cmdbuild.data.store.email;

import com.google.common.base.Function;

public class Functions {

	private static class Name<T extends EmailAccount> implements Function<T, String> {

		private Name() {
		}

		@Override
		public String apply(final T input) {
			return input.getName();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Name NAME = new Name<>();

	@SuppressWarnings("unchecked")
	public static <T extends EmailAccount> Name<T> name() {
		return NAME;
	}

	public static class IsDefault<T extends EmailAccount> implements Function<T, Boolean> {

		private IsDefault() {
		}

		@Override
		public Boolean apply(final T input) {
			return input.isDefault();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final IsDefault IS_DEFAULT = new IsDefault<>();

	@SuppressWarnings("unchecked")
	public static <T extends EmailAccount> IsDefault<T> isDefault() {
		return IS_DEFAULT;
	}

	private Functions() {
		// prevents instantiation
	}

}
