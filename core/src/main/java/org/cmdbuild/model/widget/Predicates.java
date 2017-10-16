package org.cmdbuild.model.widget;

import static com.google.common.base.Predicates.compose;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static Predicate<Widget> active(final Predicate<Boolean> delegate) {
		return widget(Functions.active(), delegate);
	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static Predicate<Widget> sourceClass(final Predicate<String> delegate) {
		return widget(Functions.sourceClass(), delegate);
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends Widget, T> Predicate<F> widget(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
