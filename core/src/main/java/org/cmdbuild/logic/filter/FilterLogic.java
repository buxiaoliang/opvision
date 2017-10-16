package org.cmdbuild.logic.filter;

import java.util.Optional;

import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.logic.Logic;

import com.google.common.collect.ForwardingObject;

public interface FilterLogic extends Logic {

	interface Filter {

		Long getId();

		String getName();

		String getDescription();

		String getClassName();

		String getConfiguration();

		boolean isShared();

	}

	abstract class ForwardingFilter extends ForwardingObject implements Filter {

		@Override
		protected abstract Filter delegate();

		@Override
		public Long getId() {
			return delegate().getId();
		}

		@Override
		public String getName() {
			return delegate().getName();
		}

		@Override
		public String getDescription() {
			return delegate().getDescription();
		}

		@Override
		public String getClassName() {
			return delegate().getClassName();
		}

		@Override
		public String getConfiguration() {
			return delegate().getConfiguration();
		}

		@Override
		public boolean isShared() {
			return delegate().isShared();
		}

	}

	Filter create(Filter filter);

	Optional<Filter> read(Filter filter);

	void update(Filter filter);

	void delete(Filter filter);

	Iterable<Filter> readForCurrentUser(String className);

	PagedElements<Filter> readShared(String className, int start, int limit);

	PagedElements<Filter> readNotShared(String className, int start, int limit);

	Iterable<Filter> getDefaults(String className, String groupName);

	void setDefaultsForGroup(String group, Iterable<Long> filters);

	void setDefaultGroups(Long filter, Iterable<String> groups);

	Iterable<String> getGroups(Long filter);

}
