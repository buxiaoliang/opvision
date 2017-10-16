package org.cmdbuild.service.rest.v2.cxf;

import static com.google.common.reflect.Reflection.newProxy;
import static java.util.Optional.empty;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.service.rest.v2.cxf.util.Json.safeJsonObject;

import java.util.Optional;

import org.cmdbuild.logic.filter.FilterLogic;
import org.cmdbuild.logic.filter.FilterLogic.Filter;
import org.json.JSONException;
import org.json.JSONObject;

public class DefaultFilterLoader implements FilterLoader {

	private final FilterLogic filterLogic;
	private final FilterLogic temporaryFilterLogic;
	private final ErrorHandler errorHandler;

	public DefaultFilterLoader(final FilterLogic filterLogic, final FilterLogic temporaryFilterLogic,
			final ErrorHandler errorHandler) {
		this.filterLogic = filterLogic;
		this.temporaryFilterLogic = temporaryFilterLogic;
		this.errorHandler = errorHandler;
	}

	@Override
	public String load(String value) {
		String output = value;
		{
			try {
				final JSONObject jsonFilter = safeJsonObject(value);
				final FilterLogic filterLogic;
				final Long filterId;
				if (jsonFilter.has("_id")) {
					filterId = jsonFilter.getLong("_id");
					filterLogic = this.filterLogic;
				} else if (jsonFilter.has("_temporaryId")) {
					filterId = jsonFilter.getLong("_temporaryId");
					filterLogic = this.temporaryFilterLogic;
				} else {
					filterId = null;
					filterLogic = newProxy(FilterLogic.class, unsupported("should not be used"));
				}
				final Optional<Filter> filter =
						(filterId == null) ? empty() : filterLogic.read(new FilterLogic.ForwardingFilter() {

							private final Filter UNSUPPORTED =
									newProxy(Filter.class, unsupported("should not be used"));

							@Override
							protected Filter delegate() {
								return UNSUPPORTED;
							}

							public Long getId() {
								return filterId;
							};

						});
				if (filter.isPresent()) {
					output = filter.get().getConfiguration();
				} else if (filterId != null) {
					output = null;
				} else {
					output = value;
				}
			} catch (final JSONException e) {
				errorHandler.propagate(e);
			}
		}
		return output;
	}

}
