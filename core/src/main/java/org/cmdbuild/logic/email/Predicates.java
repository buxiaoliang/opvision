package org.cmdbuild.logic.email;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static org.cmdbuild.logic.email.Functions.status;

import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailLogic.Status;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static Predicate<Email> statusIs(final Status value) {
		return email(status(), equalTo(value));
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends Email> Predicate<T> temporary() {
		return email(Functions.temporary(), equalTo(true));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends Email, T> Predicate<F> email(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
