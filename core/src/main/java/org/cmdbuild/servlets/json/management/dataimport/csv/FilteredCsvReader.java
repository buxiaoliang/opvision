package org.cmdbuild.servlets.json.management.dataimport.csv;

import static com.google.common.collect.FluentIterable.from;

import java.io.IOException;
import java.util.Map.Entry;

import javax.activation.DataHandler;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

public class FilteredCsvReader extends ForwardingCsvReader {

	public static interface Callback {

		void attributeNotFound(String name);

	}

	private static class FilteredCsvLine extends ForwardingCsvLine {

		private final CsvLine delegate;
		private final CMClass target;
		private final Callback callback;

		private FilteredCsvLine(final CsvLine delegate, final CMClass target, final Callback callback) {
			this.delegate = delegate;
			this.target = target;
			this.callback = callback;
		}

		@Override
		protected CsvLine delegate() {
			return delegate;
		}

		@Override
		public Iterable<Entry<String, String>> entries() {
			return from(super.entries()) //
					.filter(new Predicate<Entry<String, String>>() {

						@Override
						public boolean apply(final Entry<String, String> input) {
							final CMAttribute attribute = target.getAttribute(input.getKey());
							final boolean output = (attribute != null) && attribute.isActive();
							if (!output) {
								callback.attributeNotFound(input.getKey());
							}
							return output;
						}

					});
		}

	}

	private static class FilteredCsvData extends ForwardingCsvData {

		private final CsvData delegate;
		private final CMClass target;
		private final Callback callback;

		private FilteredCsvData(final CsvData delegate, final CMClass target, final Callback callback) {
			this.delegate = delegate;
			this.target = target;
			this.callback = callback;
		}

		@Override
		protected CsvData delegate() {
			return delegate;
		}

		@Override
		public Iterable<String> headers() {
			return from(delegate.headers()) //
					.filter(new Predicate<String>() {

						@Override
						public boolean apply(final String input) {
							final CMAttribute attribute = target.getAttribute(input);
							final boolean output = (attribute != null) && attribute.isActive();
							if (!output) {
								callback.attributeNotFound(input);
							}
							return output;
						}

					});
		}

		@Override
		public Iterable<CsvLine> lines() {
			return from(delegate.lines()) //
					.transform(new Function<CsvLine, CsvLine>() {

						@Override
						public FilteredCsvLine apply(final CsvLine input) {
							return new FilteredCsvLine(input, target, callback);
						}

					});
		}

	}

	private final CsvReader delegate;
	private final CMClass target;
	private final Callback callback;

	public FilteredCsvReader(final CsvReader delegate, final CMClass target, final Callback callback) {
		this.delegate = delegate;
		this.target = target;
		this.callback = callback;
	}

	@Override
	protected CsvReader delegate() {
		return delegate;
	}

	@Override
	public CsvData read(final DataHandler dataHandler) throws IOException {
		return new FilteredCsvData(super.read(dataHandler), target, callback);
	}

}
