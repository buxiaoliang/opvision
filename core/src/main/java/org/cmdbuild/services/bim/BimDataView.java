package org.cmdbuild.services.bim;

import java.util.List;

import org.cmdbuild.auth.logging.LoggingSupport;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMIdentifier;
import org.cmdbuild.services.bim.DefaultBimDataView.BimCard;
import org.slf4j.Logger;

public interface BimDataView {

	Logger logger = LoggingSupport.logger;

	CMCard fetchCard(String className, Long id);

	Iterable<? extends CMClass> findClasses();

	BimCard getBimDataFromGlobalid(String globalId);

	List<CMCard> getCardsWithAttributeAndValue(CMIdentifier classIdentifier, Object attributeValue,
			String attributeName);

	CMCard getCmCardFromGlobalId(String globalId, String className);

	Long getIdFromGlobalId(String globalId, String className);

	Long getProjectCardIdFromRootCard(Long rootId, String rootClassName);

	Long getRootId(Long cardId, String className, String referenceRootName);

}
