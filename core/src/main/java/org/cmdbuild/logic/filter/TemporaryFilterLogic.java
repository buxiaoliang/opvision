package org.cmdbuild.logic.filter;

import static com.google.common.reflect.Reflection.newProxy;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static org.cmdbuild.common.utils.Reflection.unsupported;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;

import org.cmdbuild.logic.auth.SessionLogic;

import com.google.common.base.Supplier;

public class TemporaryFilterLogic extends ForwardingFilterLogic {

	private static final FilterLogic UNSUPPORTED = newProxy(FilterLogic.class, unsupported("method not supported"));

	private final Map<String, Map<Long, Filter>> filtersBySession;
	private final SessionLogic sessionLogic;
	private final Supplier<Long> idSupplier;

	public TemporaryFilterLogic(final SessionLogic sessionLogic, final Supplier<Long> idSupplier) {
		this.filtersBySession = new HashMap<>();
		this.sessionLogic = sessionLogic;
		this.idSupplier = idSupplier;
	}

	@Override
	protected FilterLogic delegate() {
		return UNSUPPORTED;
	}

	@Override
	public Filter create(final Filter filter) {
		final Long id = idSupplier.get();
		final Filter _filter = new ForwardingFilter() {

			@Override
			public Long getId() {
				return id;
			}

			@Override
			protected Filter delegate() {
				return filter;
			}

		};
		filters().put(id, _filter);
		return _filter;
	}

	@Override
	public Optional<Filter> read(final Filter filter) {
		return ofNullable(filters().get(filter.getId()));
	}

	@Override
	public void update(final Filter filter) {
		check(filter);
		filters().put(filter.getId(), filter);
	}

	@Override
	public void delete(final Filter filter) {
		check(filter);
		filters().remove(filter.getId());
	}

	@Override
	public Iterable<Filter> readForCurrentUser(final String className) {
		return filters().values().stream() //
				.filter(input -> input.getClassName().equals(className)) //
				.collect(toList());
	}

	private synchronized Map<Long, Filter> filters() {
		final Collection<String> remove = new HashSet<>();
		for (final String element : filtersBySession.keySet()) {
			if (!sessionLogic.exists(element)) {
				remove.add(element);
			}
		}
		for (final String element : remove) {
			filtersBySession.remove(element);
		}
		final String current = sessionLogic.getCurrent();
		Map<Long, Filter> filters = filtersBySession.get(current);
		if (filters == null) {
			filters = new HashMap<>();
			filtersBySession.put(current, filters);
		}
		return filters;
	}

	private void check(final Filter filter) {
		filters().get(filter.getId());
	}

}
