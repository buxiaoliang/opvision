package org.cmdbuild.servlets.json.serializers.translations.commons;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.logic.data.access.DataAccessLogic;

public interface DataAccessLogicHelper
		/*
		 * Should not be needed
		 */
		extends DataAccessLogic {

	Iterable<? extends CMClass> findLocalizableClasses(boolean activeOnly);

}
