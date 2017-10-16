package org.cmdbuild.services.sync.store;

import com.google.common.base.Function;

class Functions {

	private static class Name<T extends Attribute> implements Function<T, String> {

		private Name() {
		}

		@Override
		public String apply(final T input) {
			return input.getName();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Name TO_ATTRIBUTE_NAME = new Name<>();

	@SuppressWarnings("unchecked")
	public static <T extends Attribute> Function<T, String> toAttributeName() {
		return TO_ATTRIBUTE_NAME;
	}

	private static class Key<T extends Attribute> implements Function<T, Boolean> {

		private Key() {
		}

		@Override
		public Boolean apply(final T input) {
			return input.isKey();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Key TO_ATTRIBUTE_KEY = new Key<>();

	@SuppressWarnings("unchecked")
	public static <T extends Attribute> Function<T, Boolean> toAttributeKey() {
		return TO_ATTRIBUTE_KEY;
	}

	private Functions() {
		// prevents instantiation
	}

}
