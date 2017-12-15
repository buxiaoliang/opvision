package org.cmdbuild.services.template.engine;

import static com.google.common.base.Functions.identity;
import static com.google.common.collect.FluentIterable.from;
import static java.util.Collections.emptyList;
import static org.apache.commons.lang.StringUtils.isBlank;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.Validate.isTrue;
import static org.apache.commons.lang3.Validate.notNull;
import static org.cmdbuild.common.Constants.DATETIME_PRINTING_PATTERN;
import static org.joda.time.format.DateTimeFormat.forPattern;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.cmdbuild.common.template.engine.Engine;
import org.cmdbuild.dao.function.CMFunction;
import org.cmdbuild.dao.function.CMFunction.CMFunctionParameter;
import org.cmdbuild.dao.function.CMFunction.CMFunctionOutputParameter;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.joda.time.DateTime;

import com.google.common.base.Function;
import com.google.common.base.Splitter;

public class FunctionEngine implements Engine {

	public static class Builder implements org.apache.commons.lang3.builder.Builder<FunctionEngine> {

		private CMDataView dataView;
		private DataAccessLogic dataAccessLogic;
		private Function<Object, Object> converter;

		private Builder() {
			// use factory method
		}

		@Override
		public FunctionEngine build() {
			notNull(dataView, "missing '%s'", CMDataView.class);
			notNull(dataAccessLogic, "missing '%s'", DataAccessLogic.class);
			converter = defaultIfNull(converter, identity());
			return new FunctionEngine(this);
		}

		public Builder withDataView(final CMDataView dataView) {
			this.dataView = dataView;
			return this;
		}

		public Builder withDataAccessLogic(final DataAccessLogic dataAccessLogic) {
			this.dataAccessLogic = dataAccessLogic;
			return this;
		}

		public Builder withConverter(final Function<Object, Object> converter) {
			this.converter = converter;
			return this;
		}

	}

	public static Builder newInstance() {
		return new Builder();
	}

	public static final Function<Object, Object> DEFAULT_CONVERTER = new Function<Object, Object>() {

		@Override
		public Object apply(final Object input) {
			final Object output;
			if (input instanceof DateTime) {
				output = forPattern(DATETIME_PRINTING_PATTERN).print(DateTime.class.cast(input));
			} else {
				output = input;
			}
			return output;
		}

	};

	private static final Pattern PATTERN = Pattern.compile("^([^()]+)\\((.*)\\)$");
	private static final String SEPARATOR = ",";

	/**
	 * @deprecated enclose within a logic
	 */
	@Deprecated
	private final CMDataView dataView;
	private final DataAccessLogic dataAccessLogic;
	private final Function<Object, Object> converter;

	private FunctionEngine(final Builder builder) {
		this.dataView = builder.dataView;
		this.dataAccessLogic = builder.dataAccessLogic;
		this.converter = builder.converter;
	}

	@Override
	public Object eval(final String expression) {
		final Matcher matcher = PATTERN.matcher(expression);
		isTrue(matcher.matches(), "invalid expression '%s'", expression);
		final String name = matcher.group(1);
		final CMFunction function = notNull(dataView.findFunctionByName(name), "missing function '%s'", name);
		final String parameters = matcher.group(2);
		final List<String> values = isBlank(parameters) ? emptyList()
				: Splitter.on(SEPARATOR) //
						.trimResults() //
						.splitToList(parameters);
		final List<CMFunctionParameter> inputs = function.getInputParameters();
		isTrue(inputs.size() == values.size(), "values (%d) mismatch input parameters (%d)", values.size(),
				inputs.size());
		final Map<String, Object> params = new HashMap<>();
		final Iterator<String> valuesItr = values.iterator();
		inputs.forEach(input -> params.put(input.getName(), valuesItr.next()));
		final Collection<CMFunctionOutputParameter> outputs = function.getOutputParameters();
		isTrue(outputs.size() == 1, "only one output parameter supported");
		final CMFunctionParameter output = outputs.iterator().next();
		return from(dataAccessLogic.fetchSQLCards(name,
				QueryOptions.newQueryOption() //
						.parameters(params) //
						.limit(1) //
						.build())) //
								.first() //
								.transform(input -> input.getAttribute(output.getName())) //
								.transform(converter) //
								.get();
	}

}
