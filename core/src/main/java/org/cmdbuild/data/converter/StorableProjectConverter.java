package org.cmdbuild.data.converter;

import static org.apache.commons.lang.BooleanUtils.toBooleanDefaultIfNull;
import static org.apache.commons.lang.StringUtils.EMPTY;
import static org.apache.commons.lang.StringUtils.defaultIfBlank;
import static org.cmdbuild.logic.data.Utils.readDateTime;

import java.util.HashMap;
import java.util.Map;

import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.data.store.dao.BaseStorableConverter;
import org.cmdbuild.model.bim.StorableProject;

public class StorableProjectConverter extends BaseStorableConverter<StorableProject> {

	public static final String TABLE_NAME = "_BimProject";
	public static final String PROJECT_ID = "ProjectId";
	public static final String NAME = "Code";
	public static final String DESCRIPTION = "Description";
	public static final String ACTIVE = "Active";
	public static final String LAST_CHECKIN = "LastCheckin";
	public static final String IMPORT_MAPPING = "ImportMapping";

	@Override
	public String getClassName() {
		return TABLE_NAME;
	}

	@Override
	public String getIdentifierAttributeName() {
		return PROJECT_ID;
	}

	@Override
	public StorableProject convert(CMCard card) {
		final StorableProject project = new StorableProject();
		project.setCardId(card.getId());
		project.setName(defaultIfBlank((String) card.get(NAME), EMPTY));
		project.setDescription(defaultIfBlank((String) card.get(DESCRIPTION), EMPTY));
		project.setProjectId(defaultIfBlank((String) card.get(PROJECT_ID), EMPTY));
		project.setActive(toBooleanDefaultIfNull((Boolean) card.get(ACTIVE), false));
		project.setLastCheckin(readDateTime(card, LAST_CHECKIN));
		project.setImportMapping(defaultIfBlank((String) card.get(IMPORT_MAPPING), EMPTY));
		return project;
	}

	@Override
	public Map<String, Object> getValues(StorableProject storableProject) {
		final Map<String, Object> values = new HashMap<String, Object>();
		values.put(NAME, storableProject.getName());
		values.put(DESCRIPTION, storableProject.getDescription());
		values.put(PROJECT_ID, storableProject.getProjectId());
		values.put(ACTIVE, storableProject.isActive());
		values.put(LAST_CHECKIN, storableProject.getLastCheckin());
		values.put(IMPORT_MAPPING, storableProject.getImportMapping());
		return values;
	}

}
