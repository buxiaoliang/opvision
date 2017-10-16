package org.cmdbuild.servlets.json.management.dataimport.csv;

import java.io.IOException;
import java.util.Map.Entry;

import javax.activation.DataHandler;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingCsvReader extends ForwardingObject implements CsvReader {

	public static abstract class ForwardingCsvLine extends ForwardingObject implements CsvLine {

		/**
		 * Usable by subclasses only.
		 */
		protected ForwardingCsvLine() {
		}

		@Override
		protected abstract CsvLine delegate();

		@Override
		public Iterable<Entry<String, String>> entries() {
			return delegate().entries();
		}

	}

	public static abstract class ForwardingCsvData extends ForwardingObject implements CsvData {

		/**
		 * Usable by subclasses only.
		 */
		protected ForwardingCsvData() {
		}

		@Override
		protected abstract CsvData delegate();

		@Override
		public Iterable<String> headers() {
			return delegate().headers();
		}

		@Override
		public Iterable<CsvLine> lines() {
			return delegate().lines();
		}

	}

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingCsvReader() {
	}

	@Override
	protected abstract CsvReader delegate();

	@Override
	public CsvData read(final DataHandler dataHandler) throws IOException {
		return delegate().read(dataHandler);
	}

}
