package org.cmdbuild.logic.report;

import static com.google.common.base.Predicates.alwaysTrue;
import static com.google.common.base.Predicates.compose;
import static com.google.common.collect.Sets.intersection;
import static com.google.common.collect.Sets.newHashSet;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.cmdbuild.common.utils.guava.Functions.set;
import static org.cmdbuild.logic.report.Functions.groups;

import java.util.Set;

import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.services.store.report.Report;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.base.Supplier;

public class Predicates {

	private static class CurrentGroupAllowed implements Predicate<Set<? super String>> {

		private final Supplier<OperationUser> supplier;

		public CurrentGroupAllowed(final Supplier<OperationUser> supplier) {
			this.supplier = supplier;
		}

		@Override
		public boolean apply(final Set<? super String> input) {
			final OperationUser operationUser = supplier.get();
			final Set<String> userGroups;
			if (isNotBlank(operationUser.getAuthenticatedUser().getDefaultGroupName())) {
				/*
				 * when the default group is selected all available groups are
				 * considered
				 */
				userGroups = newHashSet(operationUser.getAuthenticatedUser().getGroupNames());
			} else {
				userGroups = newHashSet(operationUser.getPreferredGroup().getName());
			}
			return !intersection(input, userGroups).isEmpty();
		}

	}

	/**
	 * @deprecated Use basic predicates instead.
	 */
	@Deprecated
	public static <T extends Report> Predicate<T> currentGroupAllowed(final Supplier<OperationUser> supplier) {
		return supplier.get().hasAdministratorPrivileges() ? alwaysTrue()
				: report(groups(), compose(new CurrentGroupAllowed(supplier), set()));
	}

	/**
	 * Syntactic sugar for
	 * {@link org.cmdbuild.common.utils.guava.Predicates.compose}.
	 */
	public static <F extends Report, T> Predicate<F> report(final Function<F, ? extends T> function,
			final Predicate<T> predicate) {
		return compose(predicate, function);
	}

	private Predicates() {
		// prevents instantiation
	}

}
