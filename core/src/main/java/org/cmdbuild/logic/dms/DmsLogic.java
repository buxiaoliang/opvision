package org.cmdbuild.logic.dms;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import javax.activation.DataHandler;

import org.cmdbuild.data.store.lookup.LookupImpl;
import org.cmdbuild.dms.DocumentTypeDefinition;
import org.cmdbuild.dms.MetadataGroup;
import org.cmdbuild.dms.StoredDocument;
import org.cmdbuild.dms.exception.DmsError;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.DmsException;
import org.cmdbuild.logic.Logic;

import com.google.common.base.Optional;

public interface DmsLogic extends Logic {

	interface Metadata {

		String category();

		String description();

		Iterable<MetadataGroup> metadataGroups();

	}

	/**
	 * Gets the lookup type that represents attachment categories.
	 *
	 * @return the name of the lookup type that represents attachment
	 *         categories.
	 */
	String getCategoryLookupType();

	/**
	 * Gets the {@link DocumentTypeDefinition} associated with the specified
	 * category.
	 *
	 * @param category
	 *            is the {@code Code} of the {@link LookupImpl}.
	 *
	 * @return the {@link DocumentTypeDefinition} for the specified category.
	 *
	 * @throws {@link
	 *             DmsException} if cannot read definitions.
	 */
	DocumentTypeDefinition getCategoryDefinition(String category);

	/**
	 * Gets all {@link DocumentTypeDefinition}s usable according with current
	 * configuration.
	 *
	 * @return the all {@link DocumentTypeDefinition}s.
	 *
	 * @throws {@link
	 *             DmsException} if cannot read definitions.
	 */
	Iterable<DocumentTypeDefinition> getConfiguredCategoryDefinitions();

	/**
	 * Gets all {@link DocumentTypeDefinition}s.
	 *
	 * @return the all {@link DocumentTypeDefinition}s.
	 *
	 * @throws DmsError
	 */
	Iterable<DocumentTypeDefinition> getCategoryDefinitions() throws DmsError;

	/**
	 * Gets the auto-completion rules for the specified class.
	 *
	 * @param classname
	 *            the name of the class.
	 *
	 * @return maps of metadata names and values grouped by metadata group.
	 *
	 * @throws DmsError
	 */
	Map<String, Map<String, String>> getAutoCompletionRulesByClass(String classname) throws DmsException;

	List<StoredDocument> search(String className, Long cardId);

	Optional<StoredDocument> search(String className, Long cardId, String fileName);

	Iterable<StoredDocument> searchVersions(String className, Long cardId, String filename);

	void create(String author, String className, Long cardId, InputStream inputStream, String fileName,
			Metadata metadata, boolean major) throws IOException, CMDBException;

	/**
	 * @param version
	 *            the version of the document, {@code null} means the last
	 *            version.
	 */
	DataHandler download(String className, Long cardId, String fileName, String version);

	void delete(String className, Long cardId, String fileName) throws DmsException;

	void update(String author, String className, Long cardId, InputStream inputStream, String filename,
			Metadata metadata, boolean major);

	void copy(String sourceClassName, Long sourceId, String filename, String destinationClassName, Long destinationId);

	void move(String sourceClassName, Long sourceId, String filename, String destinationClassName, Long destinationId);

	Map<String, String> presets();

}