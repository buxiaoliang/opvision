package org.cmdbuild.logic.report;

import static java.util.Arrays.asList;

import org.cmdbuild.services.store.report.Report;

import com.google.common.base.Function;

public class Functions {

	private static class Groups<T extends Report> implements Function<T, Iterable<String>> {

		private Groups() {
		}

		@Override
		public Iterable<String> apply(final T input) {
			return asList(input.getGroups());
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Groups GROUPS = new Groups<>();

	@SuppressWarnings("unchecked")
	public static <T extends Report> Function<T, Iterable<String>> groups() {
		return GROUPS;
	}

	private Functions() {
		// prevents instantiation
	}

}
