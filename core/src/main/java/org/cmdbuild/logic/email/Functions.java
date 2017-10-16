package org.cmdbuild.logic.email;

import org.cmdbuild.logic.email.EmailLogic.Email;

import com.google.common.base.Function;

public class Functions {

	private static class Status<T extends Email> implements Function<T, EmailLogic.Status> {

		private Status() {
		}

		@Override
		public EmailLogic.Status apply(final Email input) {
			return input.getStatus();
		};

	}

	@SuppressWarnings("rawtypes")
	private static Status STATUS = new Status<>();

	@SuppressWarnings("unchecked")
	public static <T extends Email> Function<T, EmailLogic.Status> status() {
		return STATUS;
	}

	private static class Temporary<T extends Email> implements Function<T, Boolean> {

		private Temporary() {
		}

		@Override
		public Boolean apply(final Email input) {
			return input.isTemporary();
		};

	}

	@SuppressWarnings("rawtypes")
	private static Temporary TEMPORARY = new Temporary<>();

	@SuppressWarnings("unchecked")
	public static <T extends Email> Function<T, Boolean> temporary() {
		return TEMPORARY;
	}

	private Functions() {
		// prevents instantiation
	}

}
