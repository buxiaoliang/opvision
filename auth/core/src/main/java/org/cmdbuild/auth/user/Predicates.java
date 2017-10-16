package org.cmdbuild.auth.user;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends CMUser> Predicate<T> privileged() {
		return user(Functions.privileged(), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends CMUser, T> Predicate<F> user(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
