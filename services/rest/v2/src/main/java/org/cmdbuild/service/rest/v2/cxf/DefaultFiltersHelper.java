package org.cmdbuild.service.rest.v2.cxf;

import static com.google.common.collect.Iterables.size;
import static java.lang.Integer.MAX_VALUE;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.cmdbuild.service.rest.v2.model.Models.newFilter;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseMultiple;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseSingle;

import java.util.Optional;

import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.filter.FilterLogic;
import org.cmdbuild.logic.filter.ForwardingFilterLogic;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;

public class DefaultFiltersHelper implements FiltersHelper {

	private static class Check extends ForwardingFilterLogic {

		private final FilterLogic delegate;
		private final DataAccessLogic dataAccessLogic;
		private final ErrorHandler errorHandler;

		public Check(final FilterLogic delegate, final DataAccessLogic dataAccessLogic,
				final ErrorHandler errorHandler) {
			this.delegate = delegate;
			this.dataAccessLogic = dataAccessLogic;
			this.errorHandler = errorHandler;
		}

		@Override
		protected FilterLogic delegate() {
			return delegate;
		}

		@Override
		public Filter create(final Filter filter) {
			checkClass(filter.getClassName());
			return super.create(filter);
		}

		@Override
		public Iterable<Filter> readForCurrentUser(final String className) {
			checkClass(className);
			return super.readForCurrentUser(className);
		}

		@Override
		public Optional<Filter> read(final Filter filter) {
			checkClass(filter.getClassName());
			checkFilter(filter.getId());
			return super.read(filter);
		}

		@Override
		public void update(final Filter filter) {
			checkClass(filter.getClassName());
			checkFilter(filter.getId());
			super.update(filter);
		}

		@Override
		public void delete(final Filter filter) {
			checkClass(filter.getClassName());
			checkFilter(filter.getId());
			super.delete(filter);
		}

		private void checkClass(final String classId) {
			if (dataAccessLogic.findClass(classId) == null) {
				errorHandler.classNotFound(classId);
			}
		}

		private void checkFilter(final Long filterId) {
			if (!super.read(wrap(newFilter() //
					.withId(filterId) //
					.build())).isPresent()) {
				errorHandler.filterNotFound(filterId);
			}
		}

	}

	private static FilterLogic.Filter wrap(final Filter delegate) {
		return new FilterLogic.Filter() {

			@Override
			public Long getId() {
				return delegate.getId();
			}

			@Override
			public String getName() {
				return delegate.getName();
			}

			@Override
			public String getDescription() {
				return delegate.getDescription();
			}

			@Override
			public String getClassName() {
				return delegate.getTarget();
			}

			@Override
			public String getConfiguration() {
				return delegate.getConfiguration();
			}

			@Override
			public boolean isShared() {
				return delegate.isShared();
			}

		};
	}

	private static Filter wrapSimple(final FilterLogic.Filter delegate) {
		return newFilter() //
				.withId(delegate.getId()) //
				.withDescription(delegate.getDescription()) //
				.build();
	}

	private static Filter wrapFull(final FilterLogic.Filter delegate) {
		return newFilter() //
				.withId(delegate.getId()) //
				.withName(delegate.getName()) //
				.withDescription(delegate.getDescription()) //
				.withTarget(delegate.getClassName()) //
				.withConfiguration(delegate.getConfiguration()) //
				.withShared(delegate.isShared()) //
				.build();
	}

	private final ErrorHandler errorHandler;
	private final FilterLogic filterLogic;
	private final DataAccessLogic dataAccessLogic;

	public DefaultFiltersHelper(final ErrorHandler errorHandler, final FilterLogic filterLogic,
			final DataAccessLogic dataAccessLogic) {
		this.errorHandler = errorHandler;
		this.filterLogic = filterLogic;
		this.dataAccessLogic = dataAccessLogic;
	}

	@Override
	public ResponseSingle<Filter> create(final String classId, final Filter element) {
		final FilterLogic.Filter created = check(filterLogic) //
				.create(new FilterLogic.ForwardingFilter() {

					@Override
					protected FilterLogic.Filter delegate() {
						return wrap(element);
					}

					/*
					 * Forces target according with path.
					 */
					@Override
					public String getClassName() {
						return classId;
					}

				});
		return newResponseSingle(Filter.class) //
				.withElement(wrapSimple(created)).build();
	}

	@Override
	public ResponseMultiple<Filter> readAll(final String classId, final Integer limit, final Integer offset) {
		final Iterable<FilterLogic.Filter> elements = check(filterLogic) //
				.readForCurrentUser(classId);
		return newResponseMultiple(Filter.class) //
				.withElements(stream(elements.spliterator(), false) //
						.map(input -> wrapSimple(input)) //
						.skip(defaultIfNull(offset, 0)) //
						.limit(defaultIfNull(limit, MAX_VALUE)) //
						.collect(toList())) //
				.withMetadata(newMetadata() //
						.withTotal(size(elements)) //
						.build())
				.build();
	}

	@Override
	public ResponseSingle<Filter> read(final String classId, final Long filterId) {
		final Optional<FilterLogic.Filter> read = check(filterLogic) //
				.read(wrap(newFilter() //
						.withId(filterId) //
						.withTarget(classId) //
						.build()));
		return newResponseSingle(Filter.class) //
				.withElement(wrapFull(read.get())) //
				.build();
	}

	@Override
	public void update(final String classId, final Long filterId, final Filter element) {
		check(filterLogic) //
				.update(new FilterLogic.ForwardingFilter() {

					@Override
					protected FilterLogic.Filter delegate() {
						return wrap(element);
					}

					/*
					 * Forces id according with path.
					 */
					@Override
					public Long getId() {
						return filterId;
					}

					/*
					 * Forces target according with path.
					 */
					@Override
					public String getClassName() {
						return classId;
					}

				});
	}

	@Override
	public void delete(final String classId, final Long filterId) {
		check(filterLogic) //
				.delete(wrap(newFilter() //
						.withId(filterId) //
						.withTarget(classId) //
						.build()));
	}

	private FilterLogic check(final FilterLogic delegate) {
		return new Check(delegate, dataAccessLogic, errorHandler);
	}

}
