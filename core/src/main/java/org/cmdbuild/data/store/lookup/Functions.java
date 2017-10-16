package org.cmdbuild.data.store.lookup;

import com.google.common.base.Function;

public class Functions {

	private static final Function<Lookup, Long> LOOKUP_ID = new Function<Lookup, Long>() {

		@Override
		public Long apply(final Lookup input) {
			return input.getId();
		}

	};

	private static final Function<Lookup, String> LOOKUP_TRANSLATION_UUID = new Function<Lookup, String>() {

		@Override
		public String apply(final Lookup input) {
			return input.getTranslationUuid();
		}

	};

	public static Function<Lookup, Long> toLookupId() {
		return LOOKUP_ID;
	}

	public static Function<Lookup, String> toTranslationUuid() {
		return LOOKUP_TRANSLATION_UUID;
	}

	private static class Description<T extends Lookup> implements Function<T, String> {

		@Override
		public String apply(final Lookup input) {
			return input.getDescription();
		}

	};

	@SuppressWarnings("rawtypes")
	private static final Description DESCRIPTION = new Description<>();

	@SuppressWarnings("unchecked")
	public static <T extends Lookup> Function<T, String> description() {
		return DESCRIPTION;
	}

	private static class IsDefault<T extends Lookup> implements Function<T, Boolean> {

		@Override
		public Boolean apply(final Lookup input) {
			return input.isDefault();
		}

	};

	@SuppressWarnings("rawtypes")
	private static final IsDefault IS_DEFAULT = new IsDefault<>();

	@SuppressWarnings("unchecked")
	public static <T extends Lookup> Function<T, Boolean> isDefault() {
		return IS_DEFAULT;
	}

	private static class LookupType<T extends Lookup>
			implements Function<T, org.cmdbuild.data.store.lookup.LookupType> {

		@Override
		public org.cmdbuild.data.store.lookup.LookupType apply(final T input) {
			return input.type();
		}

	};

	private static class IsActive<T extends Lookup> implements Function<T, Boolean> {

		@Override
		public Boolean apply(final Lookup input) {
			return input.active();
		}

	};

	@SuppressWarnings("rawtypes")
	private static final IsActive IS_ACTIVE = new IsActive<>();

	@SuppressWarnings("unchecked")
	public static <T extends Lookup> Function<T, Boolean> isActive() {
		return IS_ACTIVE;
	}

	@SuppressWarnings("rawtypes")
	private static final LookupType LOOKUP_TYPE = new LookupType<>();

	@SuppressWarnings("unchecked")
	public static <T extends Lookup> Function<T, org.cmdbuild.data.store.lookup.LookupType> toLookupType() {
		return LOOKUP_TYPE;
	}

	private static class LookupTypeName<T extends org.cmdbuild.data.store.lookup.LookupType>
			implements Function<T, String> {

		@Override
		public String apply(final org.cmdbuild.data.store.lookup.LookupType input) {
			return input.name;
		}

	};

	@SuppressWarnings("rawtypes")
	private static final LookupTypeName LOOKUP_TYPE_NAME = new LookupTypeName<>();

	@SuppressWarnings("unchecked")
	public static <T extends org.cmdbuild.data.store.lookup.LookupType> Function<T, String> lookupTypeName() {
		return LOOKUP_TYPE_NAME;
	}

	private Functions() {
		// prevents instantiation
	}

}
