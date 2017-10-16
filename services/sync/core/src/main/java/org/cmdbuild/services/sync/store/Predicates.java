package org.cmdbuild.services.sync.store;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static org.cmdbuild.services.sync.store.Functions.toAttributeKey;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends Attribute> Predicate<T> keyAttributes() {
		return attribute(toAttributeKey(), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends Attribute, T> Predicate<F> attribute(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
