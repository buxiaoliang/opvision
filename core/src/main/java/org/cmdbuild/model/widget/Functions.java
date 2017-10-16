package org.cmdbuild.model.widget;

import com.google.common.base.Function;

public class Functions {

	private static class Active<T extends Widget> implements Function<T, Boolean> {

		private Active() {
		}

		@Override
		public Boolean apply(final T input) {
			return input.isActive();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Active ACTIVE = new Active<>();

	@SuppressWarnings("unchecked")
	public static <T extends Widget> Function<T, Boolean> active() {
		return ACTIVE;
	}

	private static class SourceClass<T extends Widget> implements Function<T, String> {

		private SourceClass() {
		}

		@Override
		public String apply(final T input) {
			return input.getSourceClass();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final SourceClass SOURCE_CLASS = new SourceClass<>();

	@SuppressWarnings("unchecked")
	public static <T extends Widget> Function<T, String> sourceClass() {
		return SOURCE_CLASS;
	}

	private Functions() {
		// prevents instantiation
	}

}
