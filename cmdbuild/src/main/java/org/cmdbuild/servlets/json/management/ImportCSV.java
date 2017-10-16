package org.cmdbuild.servlets.json.management;

import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Maps.transformValues;
import static com.google.common.collect.Maps.uniqueIndex;
import static com.google.common.reflect.Reflection.newProxy;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.common.utils.guava.Functions.toKey;
import static org.cmdbuild.common.utils.guava.Functions.toValue;
import static org.cmdbuild.exception.NotFoundException.NotFoundExceptionType.ATTRIBUTE_NOTFOUND;
import static org.cmdbuild.servlets.json.CommunicationConstants.ELEMENTS;
import static org.cmdbuild.servlets.json.CommunicationConstants.ENTRIES;
import static org.cmdbuild.servlets.json.CommunicationConstants.FILE;
import static org.cmdbuild.servlets.json.CommunicationConstants.ID_CLASS;
import static org.cmdbuild.servlets.json.CommunicationConstants.SEPARATOR;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.activation.DataHandler;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.listeners.CMDBContext;
import org.cmdbuild.logic.data.access.CardStorableConverter;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.DataAccessLogic.CreateCard;
import org.cmdbuild.logic.data.access.ForwardingDataAccessLogic;
import org.cmdbuild.model.data.Card;
import org.cmdbuild.services.json.dto.JsonResponse;
import org.cmdbuild.servlets.json.JSONBaseWithSpringContext;
import org.cmdbuild.servlets.json.management.dataimport.CardFiller;
import org.cmdbuild.servlets.json.management.dataimport.csv.CSVCard;
import org.cmdbuild.servlets.json.management.dataimport.csv.CSVData;
import org.cmdbuild.servlets.json.management.dataimport.csv.CSVImporter.CsvCard;
import org.cmdbuild.servlets.json.management.dataimport.csv.CsvReader;
import org.cmdbuild.servlets.json.management.dataimport.csv.CsvReader.CsvLine;
import org.cmdbuild.servlets.json.management.dataimport.csv.SuperCsvCsvReader;
import org.cmdbuild.servlets.utils.FileItemDataSource;
import org.cmdbuild.servlets.utils.Parameter;
import org.codehaus.jackson.annotate.JsonProperty;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.supercsv.prefs.CsvPreference;

import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.common.collect.Lists;

public class ImportCSV extends JSONBaseWithSpringContext {

	private static class JsonCsvLine {

		private static class Builder implements org.apache.commons.lang3.builder.Builder<JsonCsvLine> {

			private static final Map<String, String> NO_ENTRIES = Collections.emptyMap();

			private Map<String, String> entries;

			private Builder() {
				// use factory method
			}

			@Override
			public JsonCsvLine build() {
				entries = defaultIfNull(entries, NO_ENTRIES);
				return new JsonCsvLine(this);
			}

			public Builder withEntries(final Map<String, String> entries) {
				this.entries = entries;
				return this;
			}

			@Override
			public String toString() {
				return reflectionToString(this, SHORT_PREFIX_STYLE);
			}

		}

		public static Builder newInstance() {
			return new Builder();
		}

		private final Map<String, String> entries;

		private JsonCsvLine(final Builder builder) {
			this.entries = builder.entries;
		}

		@JsonProperty(ENTRIES)
		public Map<String, String> getEntries() {
			return entries;
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof JsonCsvLine)) {
				return false;
			}
			final JsonCsvLine other = JsonCsvLine.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.getEntries(), other.getEntries()) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(entries) //
					.toHashCode();
		}

		@Override
		public String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	private static class JsonCsvData {

		private static class Builder implements org.apache.commons.lang3.builder.Builder<JsonCsvData> {

			private List<? super JsonCsvLine> elements;

			private Builder() {
				// use factory method
			}

			@Override
			public JsonCsvData build() {
				return new JsonCsvData(this);
			}

			public Builder withElements(final Iterable<? extends JsonCsvLine> elements) {
				this.elements = Lists.newArrayList(elements);
				return this;
			}

		}

		public static Builder newInstance() {
			return new Builder();
		}

		private final List<? super JsonCsvLine> elements;

		private JsonCsvData(final Builder builder) {
			this.elements = builder.elements;
		}

		@JsonProperty(ELEMENTS)
		public List<? super JsonCsvLine> getElements() {
			return elements;
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof JsonCsvData)) {
				return false;
			}
			final JsonCsvData other = JsonCsvData.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.elements, other.elements) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(elements) //
					.toHashCode();
		}

		@Override
		public String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	@JSONExported(forceContentType = true)
	public JsonResponse readCsv( //
			@Parameter(FILE) final FileItem file, //
			@Parameter(SEPARATOR) final String separator //
	) throws IOException {
		final CsvPreference importCsvPreferences = new CsvPreference('"', separator.charAt(0), "\n");
		final CsvReader csvReader = new SuperCsvCsvReader(importCsvPreferences);
		final CsvReader.CsvData data = csvReader.read(new DataHandler(FileItemDataSource.of(file)));
		return JsonResponse.success(JsonCsvData.newInstance() //
				.withElements(from(data.lines()) //
						.transform(new Function<CsvReader.CsvLine, JsonCsvLine>() {

							private final Function<Entry<? extends String, ? extends String>, String> key = toKey();
							private final Function<Entry<? extends String, ? extends String>, String> value = toValue();

							@Override
							public JsonCsvLine apply(final CsvLine input) {
								return JsonCsvLine.newInstance() //
										.withEntries(transformValues(uniqueIndex(input.entries(), key), value)) //
										.build();
							}

						}))
				.build());
	}

	/**
	 * Stores in the session the records of the file that the user has uploaded
	 *
	 * @param file
	 *            is the uploaded file
	 * @param separatorString
	 *            the separator of the csv file
	 * @param classId
	 *            the id of the class where the records will be stored
	 */
	@JSONExported
	public void uploadCSV( //
			@Parameter(FILE) final FileItem file, //
			@Parameter(SEPARATOR) final String separatorString, //
			@Parameter(ID_CLASS) final Long classId //
	) throws IOException, JSONException {
		clearSession();
		final Collection<String> notFoundAttributes = new HashSet<>();
		final CSVData importedCsvData = userDataAccessLogic().importCsvFileFor(
				new DataHandler(FileItemDataSource.of(file)), classId, separatorString, notFoundAttributes);
		final CMClass target = userDataAccessLogic().findClass(classId);
		for (final String element : notFoundAttributes) {
			final Optional<CMDBContext> context = contextStore().get();
			if (context.isPresent()) {
				context.get().pushWarning(ATTRIBUTE_NOTFOUND.createException(target.getName(), element));
			}
		}
		sessionVars().setCsvData(importedCsvData);
	}

	/**
	 *
	 * @return the serialization of the cards
	 */
	@JSONExported
	public JSONObject getCSVRecords() throws JSONException {
		final JSONObject out = new JSONObject();
		final JSONArray rows = new JSONArray();
		out.put("rows", rows);
		final CSVData csvData = sessionVars().getCsvData();
		final DataAccessLogic dataAccessLogic = userDataAccessLogic();
		out.put("headers", from(csvData.getHeaders()).toList());

		final CMClass entryType = dataAccessLogic.findClass(csvData.getImportedClassName());
		for (final CSVCard csvCard : csvData.getCards()) {
			rows.put(serializeCSVCard(csvCard, entryType));
		}

		return out;
	}

	@JSONExported
	// TODO: move to the logic to the logic??
	public void updateCSVRecords( //
			@Parameter("data") final JSONArray jsonCards //
	) throws JSONException {

		final DataAccessLogic dataAccessLogic = userDataAccessLogic();
		final CSVData csvData = sessionVars().getCsvData();
		final CMClass importedClass = dataAccessLogic.findClass(csvData.getImportedClassName());
		final CardFiller cardFiller = new CardFiller(importedClass, userDataView(), lookupStore());

		for (int i = 0; i < jsonCards.length(); i++) {
			final JSONObject jsonCard = jsonCards.getJSONObject(i);
			final Long fakeId = jsonCard.getLong("Id");
			final CSVCard csvCard = csvData.getCard(fakeId);
			final CsvCard mutableCard = csvCard.getCMCard();
			for (final String attributeName : csvData.getHeaders()) {
				if (jsonCard.has(attributeName)) {
					final Object attributeValue = jsonCard.get(attributeName);
					if (csvCard.getInvalidAttributes().containsKey(attributeName)) {
						csvCard.getInvalidAttributes().remove(attributeName);
					}

					try {
						cardFiller.fillCardAttributeWithValue( //
								mutableCard, //
								attributeName, //
								attributeValue //
						);
					} catch (final Exception ex) {
						csvCard.addInvalidAttribute(attributeName, attributeValue);
					}
				}
			}
		}
	}

	private static class ForgivingDataAccessLogic extends ForwardingDataAccessLogic {

		private static final DataAccessLogic UNSUPPORTED =
				newProxy(DataAccessLogic.class, unsupported("should not be used"));

		private final DataAccessLogic delegate;

		public ForgivingDataAccessLogic(final DataAccessLogic delegate) {
			this.delegate = delegate;
		}

		@Override
		protected DataAccessLogic delegate() {
			return UNSUPPORTED;
		}

		@Override
		public Long createCard(final CreateCard value) {
			try {
				return delegate.createCard(value);
			} catch (final Exception e) {
				logger.warn("error creating card, skipping", e);
				return null;
			}
		}

	}

	@JSONExported
	public void storeCSVRecords( //
			@Parameter("oneByOne") final boolean oneByOne //
	) {
		final DataAccessLogic dataAccessLogic = userDataAccessLogic();
		final CSVData csvData = sessionVars().getCsvData();
		final Iterable<CSVCard> csvCards = from(csvData.getCards()) //
				// skip cards with invalid attributes
				.filter(input -> input.getInvalidAttributes().entrySet().isEmpty());
		if (oneByOne) {
			final DataAccessLogic _dataAccessLogic = new ForgivingDataAccessLogic(dataAccessLogic);
			final Collection<Long> created = new HashSet<>();
			csvCards.forEach(input -> _dataAccessLogic.createCard(new CreateCard() {

				@Override
				public Card card() {
					final CMCard card = input.getCMCard();
					return Card.newInstance() //
							.withClassName(card.getType().getIdentifier().getLocalName()) //
							.withAllAttributes(card.getValues()) //
							.withUser(operationUser().getAuthenticatedUser().getUsername()) //
							.build();
				}

				@Override
				public boolean manageAlsoDomainsAttributes() {
					return false;
				}

				@Override
				public void created(final Long value) {
					created.add(input.getFakeId());
				}

			}));

			/*
			 * Remove the created cards. So if some cards have wrong fields them
			 * can be modified
			 */
			created.forEach(input -> csvData.removeCard(input));
		} else {
			final Collection<Long> created = new HashSet<>();
			dataAccessLogic.createCards(from(csvCards) //
					.<CreateCard> transform(input -> new CreateCard() {

						@Override
						public Card card() {
							final CMCard card = input.getCMCard();
							return Card.newInstance() //
									.withClassName(card.getType().getIdentifier().getLocalName()) //
									.withAllAttributes(card.getValues()) //
									.withUser(operationUser().getAuthenticatedUser().getUsername()) //
									.build();
						}

						@Override
						public boolean manageAlsoDomainsAttributes() {
							return false;
						}

						@Override
						public void created(final Long value) {
							created.add(input.getFakeId());
						}

					}));
			created.forEach(input -> csvData.removeCard(input));
		}
	}

	@JSONExported
	public void clearSession() {
		sessionVars().setCsvData(null);
	}

	private JSONObject serializeCSVCard( //
			final CSVCard csvCard, //
			final CMClass entryType //

	) throws JSONException {

		final DataAccessLogic dataAccessLogic = userDataAccessLogic();
		final CMCard cmCard = dataAccessLogic.resolveCardReferences(entryType, csvCard.getCMCard());
		final Card card = CardStorableConverter.of(cmCard).convert(cmCard);

		final JSONObject jsonCard = cardSerializer().toClient(card);
		addEmptyAttributesToSerialization(jsonCard, cmCard);
		final JSONObject output = new JSONObject();
		final JSONObject notValidValues = new JSONObject();
		jsonCard.put("Id", csvCard.getFakeId());
		jsonCard.put("IdClass_value", csvCard.getCMCard().getType().getName());
		output.put("card", jsonCard);

		for (final Entry<String, Object> entry : csvCard.getInvalidAttributes().entrySet()) {
			notValidValues.put(entry.getKey(), entry.getValue());
		}
		output.put("not_valid_values", notValidValues);

		return output;
	}

	/*
	 * The client needs to know all the attributes for each card, but the
	 * serializer does not add the attributes with no value to the JSONCard. Use
	 * this method to check the output of the serializer and add the empty
	 * attributes
	 */
	private void addEmptyAttributesToSerialization(final JSONObject jsonCard, final CMCard cmCard)
			throws JSONException {
		final CMClass entryType = cmCard.getType();
		for (final CMAttribute cmAttribute : entryType.getAttributes()) {
			final String attributeName = cmAttribute.getName();
			if (jsonCard.has(attributeName)) {
				continue;
			} else {
				jsonCard.put(attributeName, "");
			}
		}
	}

};
