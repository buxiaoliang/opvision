package org.cmdbuild.servlets.json.serializers;

import static org.cmdbuild.auth.acl.CMGroup.GroupType.admin;
import static org.cmdbuild.auth.acl.CMGroup.GroupType.normal;
import static org.cmdbuild.auth.acl.CMGroup.GroupType.restrictedAdmin;
import static org.cmdbuild.servlets.json.CommunicationConstants.META;
import static org.cmdbuild.spring.SpringIntegrationUtils.applicationContext;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.acl.CMGroup.GroupType;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dms.DmsConfiguration;
import org.cmdbuild.exception.DmsException;
import org.cmdbuild.logic.auth.AuthenticationLogic.GroupInfo;
import org.cmdbuild.logic.dms.DmsLogic;
import org.cmdbuild.notification.Notifier;
import org.cmdbuild.services.store.report.Report;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@_Serializer
public class Serializer {

	private static final String AVAILABLE_CLASS = "availableclass";
	private static final String AVAILABLE_PROCESS_CLASS = "availableprocessclass";
	private static final String AVAILABLE_REPORT = "availablereport";
	private static final String AVAILABLE_DASHBOARDS = "availabledashboards";

	public JSONArray buildJsonAvaiableMenuItems() throws JSONException {
		final JSONArray jsonAvaiableItems = new JSONArray();

		final JSONObject jsonClassesFolder = new JSONObject();
		final JSONObject jsonReportsFolder = new JSONObject();
		final JSONObject jsonProcessFolder = new JSONObject();
		final JSONObject jsonDashboardsFolder = new JSONObject();

		jsonClassesFolder.put("text", "class");
		jsonClassesFolder.put("id", AVAILABLE_CLASS);
		jsonClassesFolder.put("iconCls", "cmdbuild-tree-folder-icon");
		jsonClassesFolder.put("cmIndex", 1);

		jsonProcessFolder.put("text", "processclass");
		jsonProcessFolder.put("id", AVAILABLE_PROCESS_CLASS);
		jsonProcessFolder.put("iconCls", "cmdbuild-tree-folder-icon");
		jsonProcessFolder.put("cmIndex", 2);

		jsonReportsFolder.put("text", "report");
		jsonReportsFolder.put("id", AVAILABLE_REPORT);
		jsonReportsFolder.put("iconCls", "cmdbuild-tree-folder-icon");
		jsonReportsFolder.put("cmIndex", 3);

		jsonDashboardsFolder.put("text", "dashboard");
		jsonDashboardsFolder.put("id", AVAILABLE_DASHBOARDS);
		jsonDashboardsFolder.put("iconCls", "cmdbuild-tree-folder-icon");
		jsonDashboardsFolder.put("cmIndex", 4);

		jsonAvaiableItems.put(jsonReportsFolder);
		jsonAvaiableItems.put(jsonClassesFolder);
		jsonAvaiableItems.put(jsonProcessFolder);
		jsonAvaiableItems.put(jsonDashboardsFolder);

		return jsonAvaiableItems;
	}

	public JSONObject serializeReportForMenu(final Report report, final String type) throws JSONException {
		final JSONObject jsonReport = new JSONObject();
		jsonReport.put("text", report.getDescription());
		jsonReport.put("parent", AVAILABLE_REPORT);
		jsonReport.put("selectable", true);
		jsonReport.put("type", type);
		jsonReport.put("subtype", report.getType().toString().toLowerCase());
		jsonReport.put("objid", report.getId());
		jsonReport.put("id", report.getId() + type);
		jsonReport.put("leaf", true);
		return jsonReport;
	}

	public JSONObject serialize(final CMGroup group) throws JSONException {
		final JSONObject jsonGroup = new JSONObject();
		jsonGroup.put("id", group.getId());
		jsonGroup.put("name", group.getName());
		jsonGroup.put("description", group.getDescription());
		jsonGroup.put("email", group.getEmail());
		jsonGroup.put("isAdministrator", group.isAdmin());
		jsonGroup.put("isCloudAdministrator", group.isRestrictedAdmin());
		// TODO check if missing
		jsonGroup.put("startingClass", group.getStartingClassId());
		jsonGroup.put("isActive", group.isActive());
		jsonGroup.put("text", group.getDescription());
		jsonGroup.put("selectable", true);
		final GroupType type;
		if (group.isAdmin() && group.isRestrictedAdmin()) {
			type = restrictedAdmin;
		} else if (group.isAdmin()) {
			type = admin;
		} else {
			type = normal;
		}
		jsonGroup.put("type", type.name());
		return jsonGroup;
	}

	public JSONArray serializeGroupsForUser(final CMUser user, final List<GroupInfo> groups) throws JSONException {
		final JSONArray jsonGroupList = new JSONArray();
		for (final GroupInfo group : groups) {
			final JSONObject row = new JSONObject();
			row.put("id", group.getId());
			row.put("description", group.getDescription());
			final String userDefaultGroupName = user.getDefaultGroupName();
			if (userDefaultGroupName != null && userDefaultGroupName.equalsIgnoreCase(group.getName())) {
				row.put("isdefault", true);
			} else {
				row.put("isdefault", false);
			}
			jsonGroupList.put(row);
		}
		return jsonGroupList;
	}

	public void addAttachmentsData(final JSONObject jsonTable, final CMClass cmClass, final DmsLogic dmsLogic,
			final Notifier notifier) throws JSONException {
		final DmsConfiguration dmsConfiguration = applicationContext().getBean(DmsConfiguration.class);
		if (!dmsConfiguration.isEnabled()) {
			return;
		}
		final Map<String, Map<String, String>> rulesByGroup = rulesByGroup(cmClass, dmsLogic, notifier);

		final JSONObject jsonGroups = new JSONObject();
		for (final String groupName : rulesByGroup.keySet()) {
			jsonGroups.put(groupName, rulesByGroup.get(groupName));
		}

		final JSONObject jsonAutocompletion = new JSONObject();
		jsonAutocompletion.put("autocompletion", jsonGroups);
		try {
			final JSONObject jsonMeta = jsonTable.getJSONObject(META);
			jsonMeta.put("attachments", jsonAutocompletion);
		} catch (final JSONException ex) {
			// there is no meta key
		}
	}

	private Map<String, Map<String, String>> rulesByGroup(final CMClass cmClass, final DmsLogic dmsLogic,
			final Notifier notifier) {
		try {
			return dmsLogic.getAutoCompletionRulesByClass(cmClass.getIdentifier().getLocalName());
		} catch (final DmsException e) {
			notifier.warn(e);
			return Collections.emptyMap();
		}
	}

}
