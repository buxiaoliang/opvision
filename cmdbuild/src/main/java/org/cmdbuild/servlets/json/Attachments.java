package org.cmdbuild.servlets.json;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.cmdbuild.services.json.dto.JsonResponse.success;
import static org.cmdbuild.servlets.json.CommunicationConstants.AUTHOR;
import static org.cmdbuild.servlets.json.CommunicationConstants.CARD_ID;
import static org.cmdbuild.servlets.json.CommunicationConstants.CATEGORIES;
import static org.cmdbuild.servlets.json.CommunicationConstants.CATEGORY;
import static org.cmdbuild.servlets.json.CommunicationConstants.CLASS_NAME;
import static org.cmdbuild.servlets.json.CommunicationConstants.CREATION;
import static org.cmdbuild.servlets.json.CommunicationConstants.DESCRIPTION;
import static org.cmdbuild.servlets.json.CommunicationConstants.FILE;
import static org.cmdbuild.servlets.json.CommunicationConstants.FILE_NAME;
import static org.cmdbuild.servlets.json.CommunicationConstants.ID;
import static org.cmdbuild.servlets.json.CommunicationConstants.LIST;
import static org.cmdbuild.servlets.json.CommunicationConstants.MAJOR;
import static org.cmdbuild.servlets.json.CommunicationConstants.MANDATORY;
import static org.cmdbuild.servlets.json.CommunicationConstants.META;
import static org.cmdbuild.servlets.json.CommunicationConstants.MODIFICATION;
import static org.cmdbuild.servlets.json.CommunicationConstants.NAME;
import static org.cmdbuild.servlets.json.CommunicationConstants.TYPE;
import static org.cmdbuild.servlets.json.CommunicationConstants.VALUES;
import static org.cmdbuild.servlets.json.CommunicationConstants.VERSION;
import static org.cmdbuild.servlets.json.CommunicationConstants.VERSIONABLE;

import java.io.IOException;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.activation.DataHandler;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.lang3.StringUtils;
import org.cmdbuild.dms.DefaultDefinitionsFactory;
import org.cmdbuild.dms.DefinitionsFactory;
import org.cmdbuild.dms.DocumentTypeDefinition;
import org.cmdbuild.dms.Metadata;
import org.cmdbuild.dms.MetadataDefinition;
import org.cmdbuild.dms.MetadataGroup;
import org.cmdbuild.dms.MetadataGroupDefinition;
import org.cmdbuild.dms.StoredDocument;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.DmsException;
import org.cmdbuild.logic.dms.DmsLogic;
import org.cmdbuild.services.json.dto.JsonResponse;
import org.cmdbuild.servlets.utils.Parameter;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.google.common.collect.Lists;

public class Attachments extends JSONBaseWithSpringContext {

	public static class JsonAttachment {

		// TODO use constants
		private static final SimpleDateFormat ATTACHMENT_DATE_FOMAT = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		private static final Iterable<MetadataGroup> NO_METADATA_GROUPS = emptyList();

		private static String format(final Date date, final Format format) {
			return (date == null) ? null : format.format(date);
		}

		private final StoredDocument attachment;

		public JsonAttachment(final StoredDocument delegate) {
			this.attachment = delegate;
		}

		@JsonProperty(FILE_NAME)
		public String getFilename() {
			return attachment.getName();
		}

		@JsonProperty(CREATION)
		public String getCreationDate() {
			return format(attachment.getCreated(), ATTACHMENT_DATE_FOMAT);
		}

		@JsonProperty(MODIFICATION)
		public String getModificationDate() {
			return format(attachment.getModified(), ATTACHMENT_DATE_FOMAT);
		}

		@JsonProperty(AUTHOR)
		public String getAuthor() {
			return attachment.getAuthor();
		}

		@JsonProperty(CATEGORY)
		public String getCategory() {
			return attachment.getCategory();
		}

		@JsonProperty(DESCRIPTION)
		public String getDescription() {
			return attachment.getDescription();
		}

		@JsonProperty(META)
		public Map<String, Map<String, String>> getMetadata() {
			final Map<String, Map<String, String>> output = new HashMap<>();
			defaultIfNull(attachment.getMetadataGroups(), NO_METADATA_GROUPS) //
					.forEach(group -> {
						output.put(group.getName(), new HashMap<>());
						group.getMetadata() //
								.forEach(metadata -> output.get(group.getName()).put(metadata.getName(),
										metadata.getValue()));
					});
			return output;
		}

		@JsonProperty(VERSION)
		public String getVersion() {
			return attachment.getVersion();
		}

		@JsonProperty(VERSIONABLE)
		public boolean getVersionable() {
			return attachment.isVersionable();
		}

	}

	public static class JsonCategoryDefinition {

		private final DocumentTypeDefinition delegate;

		public JsonCategoryDefinition(final DocumentTypeDefinition delegate) {
			this.delegate = delegate;
		}

		@JsonProperty(NAME)
		public String getName() {
			return delegate.getName();
		}

		@JsonProperty(DESCRIPTION)
		public String getDescription() {
			return delegate.getName();
		}

		@JsonProperty(META)
		public Iterable<JsonMetadataGroupDefinition> getMetadataGroups() {
			final List<JsonMetadataGroupDefinition> jsonDefinitions = Lists.newArrayList();
			for (final MetadataGroupDefinition definition : delegate.getMetadataGroupDefinitions()) {
				jsonDefinitions.add(new JsonMetadataGroupDefinition(definition));
			}
			return jsonDefinitions;
		}

	}

	public static class JsonMetadataGroupDefinition {

		private final MetadataGroupDefinition metadataGroupDefinition;

		public JsonMetadataGroupDefinition(final MetadataGroupDefinition definition) {
			this.metadataGroupDefinition = definition;
		}

		@JsonProperty(NAME)
		public String getName() {
			return metadataGroupDefinition.getName();
		}

		@JsonProperty(META)
		public Iterable<JsonMetadataDefinition> getMetadata() {
			final List<JsonMetadataDefinition> jsonDefinitions = Lists.newArrayList();
			for (final MetadataDefinition definition : metadataGroupDefinition.getMetadataDefinitions()) {
				jsonDefinitions.add(new JsonMetadataDefinition(definition));
			}
			return jsonDefinitions;
		}

	}

	public static class JsonMetadataDefinition {

		private final MetadataDefinition metadataDefinition;

		public JsonMetadataDefinition(final MetadataDefinition metadataDefinition) {
			this.metadataDefinition = metadataDefinition;
		}

		@JsonProperty(NAME)
		public String getName() {
			return metadataDefinition.getName();
		}

		@JsonProperty(TYPE)
		public String getType() {
			return metadataDefinition.getType().getId();
		}

		@JsonProperty(DESCRIPTION)
		public String getDescription() {
			return metadataDefinition.getDescription();
		}

		@JsonProperty(MANDATORY)
		public boolean isMandatory() {
			return metadataDefinition.isMandatory();
		}

		@JsonProperty(LIST)
		public boolean isList() {
			return metadataDefinition.isList();
		}

		@JsonProperty(VALUES)
		public Iterable<String> getValues() {
			return metadataDefinition.getListValues();
		}

	}

	public static class JsonAttachmentsContext {

		private final Iterable<JsonCategoryDefinition> categoriesDefinition;

		public JsonAttachmentsContext(final Iterable<JsonCategoryDefinition> categoriesDefinition) {
			this.categoriesDefinition = categoriesDefinition;
		}

		@JsonProperty(CATEGORIES)
		public Iterable<JsonCategoryDefinition> getCategories() {
			return categoriesDefinition;
		}

	}

	private static class MetadataImpl implements DmsLogic.Metadata {

		private final String category;
		private final String description;
		private final Map<String, Map<String, Object>> metadataValues;
		private final DocumentTypeDefinition documentTypeDefinition;

		private MetadataImpl(final String category, final String description,
				final Map<String, Map<String, Object>> metadataValues,
				final DocumentTypeDefinition documentTypeDefinition) {
			this.category = category;
			this.description = description;
			this.metadataValues = metadataValues;
			this.documentTypeDefinition = documentTypeDefinition;
		}

		@Override
		public String category() {
			return category;
		}

		@Override
		public String description() {
			return description;
		}

		@Override
		public Iterable<MetadataGroup> metadataGroups() {
			return metadataGroupsFrom(documentTypeDefinition, metadataValues);
		}

		private static List<MetadataGroup> metadataGroupsFrom(final DocumentTypeDefinition documentTypeDefinition,
				final Map<String, Map<String, Object>> metadataValues) {
			final List<MetadataGroup> metadataGroups = Lists.newArrayList();
			for (final MetadataGroupDefinition metadataGroupDefinition : documentTypeDefinition
					.getMetadataGroupDefinitions()) {
				final String groupMame = metadataGroupDefinition.getName();
				final Map<String, Object> allMetadataMap = metadataValues.get(groupMame);
				if (allMetadataMap == null) {
					continue;
				}

				metadataGroups.add(new MetadataGroup() {

					@Override
					public String getName() {
						return groupMame;
					}

					@Override
					public Iterable<Metadata> getMetadata() {
						final List<Metadata> metadata = Lists.newArrayList();
						for (final MetadataDefinition metadataDefinition : metadataGroupDefinition
								.getMetadataDefinitions()) {
							final String metadataName = metadataDefinition.getName();
							final Object rawValue = allMetadataMap.get(metadataName);
							metadata.add(new Metadata() {

								@Override
								public String getName() {
									return metadataName;
								}

								@Override
								public String getValue() {
									return (rawValue == null) ? StringUtils.EMPTY : rawValue.toString();
								}

							});
						}
						return metadata;
					}
				});

			}
			return metadataGroups;
		}

	}

	private static final ObjectMapper mapper = new ObjectMapper();

	private final DefinitionsFactory definitionsFactory;

	public Attachments() {
		definitionsFactory = new DefaultDefinitionsFactory();
	}

	@JSONExported
	public JsonResponse readContext() {
		final List<JsonCategoryDefinition> jsonCategories = Lists.newArrayList();
		for (final DocumentTypeDefinition element : dmsLogic().getConfiguredCategoryDefinitions()) {
			jsonCategories.add(new JsonCategoryDefinition(element));
		}
		return success(new JsonAttachmentsContext(jsonCategories));
	}

	@JSONExported
	public JsonResponse readAll( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId //
	) throws CMDBException {
		final List<JsonAttachment> output = new ArrayList<>();
		dmsLogic().search(className, cardId) //
				.forEach(input -> output.add(new JsonAttachment(input)));
		return success(output);
	}

	@JSONExported
	public DataHandler download( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter(FILE_NAME) final String filename, //
			@Parameter(value = VERSION, required = false) final String version //
	) throws CMDBException {
		return dmsLogic().download(className, cardId, filename, version);
	}

	@JSONExported
	public void create( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter(FILE) final FileItem file, //
			@Parameter(CATEGORY) final String category, //
			@Parameter(DESCRIPTION) final String description, //
			@Parameter(META) final String jsonMetadataValues, //
			@Parameter(value = MAJOR, required = false) final Boolean major //
	) throws CMDBException, IOException {
		final Map<String, Map<String, Object>> metadataValues = metadataValuesFromJson(jsonMetadataValues);
		final String username = operationUser().getAuthenticatedUser().getUsername();
		dmsLogic().create( //
				username, //
				className, //
				cardId, //
				file.getInputStream(), //
				removeFilePath(file.getName()), //
				new MetadataImpl(category, description, metadataValues, categoryDefinition(category)), //
				defaultIfNull(major, false) //
		);
	}

	/**
	 * Needed by Internet Explorer that uploads the file with full path
	 */
	private String removeFilePath(final String name) {
		final int backslashIndex = name.lastIndexOf("\\");
		final int slashIndex = name.lastIndexOf("/");
		final int fileNameIndex = Math.max(slashIndex, backslashIndex) + 1;
		return name.substring(fileNameIndex);
	}

	@JSONExported
	public void update( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter(FILE_NAME) final String filename, //
			@Parameter(value = FILE, required = false) final FileItem file, //
			@Parameter(CATEGORY) final String category, //
			@Parameter(DESCRIPTION) final String description, //
			@Parameter(META) final String jsonMetadataValues, //
			@Parameter(value = MAJOR, required = false) final Boolean major //
	) throws CMDBException, IOException {
		final Map<String, Map<String, Object>> metadataValues = metadataValuesFromJson(jsonMetadataValues);
		dmsLogic().update( //
				operationUser().getAuthenticatedUser().getUsername(), //
				className, //
				cardId, //
				file == null ? null : file.getInputStream(), //
				filename, //
				new MetadataImpl(category, description, metadataValues, categoryDefinition(category)), //
				defaultIfNull(major, false) //
		);
	}

	@JSONExported
	public void delete( //
			@Parameter(FILE_NAME) final String filename, //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId //
	) throws CMDBException {
		dmsLogic().delete(className, cardId, filename);
	}

	/*
	 * Utilities
	 */

	/**
	 * At the first level there are the metadataGroups For each metadataGroups,
	 * there is another map with the values for the group
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Map<String, Object>> metadataValuesFromJson(final String jsonMetadataValues)
			throws IOException, JsonParseException, JsonMappingException {
		return mapper.readValue(jsonMetadataValues, Map.class);
	}

	private DocumentTypeDefinition categoryDefinition(final String category) {
		try {
			return dmsLogic().getCategoryDefinition(category);
		} catch (final DmsException e) {
			notifier().warn(e);
			return definitionsFactory.newDocumentTypeDefinitionWithNoMetadata(category);
		}
	}

	private static class Preset {

		private final String id;
		private final String description;

		public Preset(final String id, final String description) {
			this.id = id;
			this.description = description;
		}

		@JsonProperty(ID)
		public String getId() {
			return id;
		}

		@JsonProperty(DESCRIPTION)
		public String getDescription() {
			return description;
		}

	}

	@JSONExported
	public JsonResponse readPresets() throws CMDBException {
		final List<Preset> elements = dmsLogic().presets() //
				.entrySet() //
				.stream().map(t -> new Preset(t.getKey(), t.getValue())) //
				.collect(toList());
		return JsonResponse.success(elements);
	}

	@JSONExported
	public JsonResponse readAllVersions( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter(FILE_NAME) final String filename //
	) throws CMDBException {
		final List<JsonAttachment> output = new ArrayList<>();
		dmsLogic().searchVersions(className, cardId, filename) //
				.forEach(input -> output.add(new JsonAttachment(input)));
		return success(output);
	}

}
