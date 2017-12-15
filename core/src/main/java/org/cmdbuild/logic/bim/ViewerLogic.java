package org.cmdbuild.logic.bim;

import org.cmdbuild.logic.Logic;
import org.cmdbuild.services.bim.DefaultBimDataView.BimCard;

public interface ViewerLogic extends Logic {

	BimCard fetchCardDataFromObjectId(String objectId, String revisionId);

	String getDescriptionOfRoot(Long cardId, String className);

	String getBaseRevisionIdForViewer(Long cardId, String className);

	String getBaseProjectId(Long cardId, String className);

}