package org.cmdbuild.data.store.lookup;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static org.cmdbuild.data.store.lookup.Functions.description;
import static org.cmdbuild.data.store.lookup.Functions.isActive;
import static org.cmdbuild.data.store.lookup.Functions.isDefault;
import static org.cmdbuild.data.store.lookup.Functions.lookupTypeName;
import static org.cmdbuild.data.store.lookup.Functions.toLookupType;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.ForwardingObject;

public class Predicates {

	private static abstract class LookupPredicate<T> extends ForwardingObject implements Predicate<Lookup> {

		/**
		 * Usable by subclasses only.
		 */
		protected LookupPredicate() {
		}

		@Override
		protected abstract Predicate<T> delegate();

		protected abstract T value(Lookup input);

		@Override
		public final boolean apply(final Lookup input) {
			return delegate().apply(value(input));
		}

	}

	private static class LookupId extends LookupPredicate<Long> {

		private final Predicate<Long> delegate;

		public LookupId(final Predicate<Long> delegate) {
			this.delegate = delegate;
		}

		@Override
		protected Predicate<Long> delegate() {
			return delegate;
		}

		@Override
		protected Long value(final Lookup input) {
			return input.getId();
		}

	}

	public static Predicate<Lookup> lookupId(final Predicate<Long> delegate) {
		return new LookupId(delegate);
	}

	private static class LookupTranslationUuid extends LookupPredicate<String> {

		private final Predicate<String> delegate;

		public LookupTranslationUuid(final Predicate<String> delegate) {
			this.delegate = delegate;
		}

		@Override
		protected Predicate<String> delegate() {
			return delegate;
		}

		@Override
		protected String value(final Lookup input) {
			return input.getTranslationUuid();
		}

	}

	public static Predicate<Lookup> lookupTranslationUuid(final Predicate<String> delegate) {
		return new LookupTranslationUuid(delegate);
	}

	public static Predicate<Lookup> lookupActive() {
		return lookup(isActive(), equalTo(true));
	}

	public static Predicate<Lookup> lookupWithType(final LookupType type) {
		return lookup(toLookupType(), lookupType(lookupTypeName(), equalTo(type.name)));
	}

	public static Predicate<Lookup> lookupWithDescription(final String value) {
		return lookup(description(), equalTo(value));
	}

	public static Predicate<LookupType> lookupTypeWithName(final String name) {
		return lookupType(lookupTypeName(), equalTo(name));
	}

	public static <T extends Lookup> Predicate<T> defaultLookup() {
		return lookup(isDefault(), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends Lookup, T> Predicate<F> lookup(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends LookupType, T> Predicate<F> lookupType(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}