package org.cmdbuild.dao.query.clause;

import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static org.cmdbuild.dao.query.clause.Functions.alias;

import org.cmdbuild.dao.query.clause.alias.Alias;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class Predicates {

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends QueryAttribute> Predicate<T> withAlias(final Alias alias) {
		return queryAttribute(alias(), equalTo(alias));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends QueryAttribute, T> Predicate<F> queryAttribute(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
