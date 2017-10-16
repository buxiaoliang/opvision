package org.cmdbuild.data.store.email;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static org.cmdbuild.data.store.email.Functions.name;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class Predicates {

	public static <T extends EmailAccount> Predicate<T> named(final String name) {
		return emailAccount(name(), equalTo(name));
	}

	public static <T extends EmailAccount> Predicate<T> isDefault() {
		return emailAccount(Functions.isDefault(), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends EmailAccount, T> Predicate<F> emailAccount(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
