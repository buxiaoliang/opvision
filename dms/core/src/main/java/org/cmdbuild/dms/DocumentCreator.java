package org.cmdbuild.dms;

import java.io.InputStream;

public interface DocumentCreator {

	DocumentSearch createDocumentSearch( //
			String className, //
			Long cardId);

	SingleDocumentSearch createSingleDocumentSearch( //
			String className, //
			Long cardId, //
			String filename);

	StorableDocument createStorableDocument( //
			String author, //
			String className, //
			Long cardId, //
			InputStream inputStream, //
			String fileName, //
			String category, //
			String description, //
			Iterable<MetadataGroup> metadataGroups, //
			boolean major);

	DocumentDownload createDocumentDownload( //
			String className, //
			Long cardId, //
			String fileName, //
			String version);

	DocumentDelete createDocumentDelete( //
			String className, //
			Long cardId, //
			String fileName);

	DocumentUpdate createDocumentUpdate( //
			String className, //
			Long cardId, //
			String filename, //
			String category, //
			String description, //
			String author, //
			Iterable<MetadataGroup> metadataGroups);

}
