package org.cmdbuild.dao.function;

import static com.google.common.base.Splitter.on;
import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Sets.newHashSet;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static java.util.Collections.unmodifiableList;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.StringUtils.defaultString;
import static org.cmdbuild.dao.entrytype.DBIdentifier.fromName;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.dao.DBTypeObject;
import org.cmdbuild.dao.entrytype.CMIdentifier;
import org.cmdbuild.dao.entrytype.DBEntryType.EntryTypeMetadata;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;

import com.google.common.base.Function;

public class DBFunction extends DBTypeObject implements CMFunction {

	public static class FunctionMetadata extends EntryTypeMetadata {

		private static final Function<String, Category> STRING_TO_CATEGORY = new Function<String, Category>() {

			@Override
			public Category apply(final String input) {
				return Category.of(input);
			};

		};

		public static final String CATEGORIES = BASE_NS + "categories";
		public static final String MASTERTABLE = BASE_NS + "mastertable";
		public static final String TAGS = BASE_NS + "tags";

		private static final String COMMA_SEPARATOR = ",";

		public Iterable<Category> getCategories() {
			return from(on(COMMA_SEPARATOR) //
					.trimResults() //
					.omitEmptyStrings() //
					.splitToList(defaultString(get(CATEGORIES)))) //
							.transform(STRING_TO_CATEGORY);
		}

		public Map<String, Object> getMetadata() {
			return ChainablePutMap.of(new HashMap<String, Object>()) //
					.chainablePut(CATEGORIES, newHashSet(getCategories())) //
					.chainablePut(MASTERTABLE, getMasterTable()) //
					.chainablePut(TAGS, newHashSet(getTags()));
		}

		private String getMasterTable() {
			return defaultString(get(MASTERTABLE));
		}

		private Iterable<String> getTags() {
			return from(on(COMMA_SEPARATOR) //
					.trimResults() //
					.omitEmptyStrings() //
					.split(defaultString(get(TAGS))));
		}

	}

	private static class DBFunctionParameter implements CMFunctionParameter {

		private final String name;
		private final CMAttributeType<?> type;

		DBFunctionParameter(final String name, final CMAttributeType<?> type) {
			Validate.notEmpty(name);
			Validate.notNull(type);
			this.name = name;
			this.type = type;
		}

		@Override
		public String getName() {
			return name;
		}

		@Override
		public CMAttributeType<?> getType() {
			return type;
		}

	}

	private static final Iterable<Category> NO_CATEGORIES = emptyList();
	private static final Map<String, Object> NO_METADATA = emptyMap();

	private final List<CMFunctionParameter> inputParameters;
	private final List<CMFunctionParameter> outputParameters;

	private final List<CMFunctionParameter> unmodifiableInputParameters;
	private final List<CMFunctionParameter> unmodifiableOutputParameters;

	private final boolean returnsSet;

	private Iterable<Category> categories;
	private Map<String, Object> metadata;

	public DBFunction(final String name, final Long id, final boolean returnsSet) {
		this(fromName(name), id, returnsSet);
	}

	public DBFunction(final CMIdentifier identifier, final Long id, final boolean returnsSet) {
		super(identifier, id);
		this.inputParameters = new ArrayList<>();
		this.unmodifiableInputParameters = unmodifiableList(inputParameters);
		this.outputParameters = new ArrayList<>();
		this.unmodifiableOutputParameters = unmodifiableList(outputParameters);
		this.returnsSet = returnsSet;
		this.categories = NO_CATEGORIES;
		this.metadata = NO_METADATA;
	}

	@Override
	public boolean returnsSet() {
		return returnsSet;
	}

	@Override
	public List<CMFunctionParameter> getInputParameters() {
		return unmodifiableInputParameters;
	}

	@Override
	public List<CMFunctionParameter> getOutputParameters() {
		return unmodifiableOutputParameters;
	}

	public void addInputParameter(final String name, final CMAttributeType<?> type) {
		inputParameters.add(new DBFunctionParameter(name, type));
	}

	public void addOutputParameter(final String name, final CMAttributeType<?> type) {
		outputParameters.add(new DBFunctionParameter(name, type));
	}

	@Override
	public Iterable<Category> getCategories() {
		return categories;
	}

	public void setCategories(final Iterable<Category> categories) {
		this.categories = defaultIfNull(categories, NO_CATEGORIES);
	}

	@Override
	public Map<String, Object> getMetadata() {
		return metadata;
	}

	public void setMetadata(final Map<String, Object> metadata) {
		this.metadata = defaultIfNull(metadata, NO_METADATA);
	}

}
