(function () {

	/**
	 * Applied attributes translations:
	 * 	- Instance data
	 * 		- id -> cardId
	 * 	- ActivityInstanceInfoList item data
	 * 		- description -> activityDescription
	 * 		- id -> activityId
	 * 		- metadata -> activityMetadata
	 * 		- performerName -> activityPerformerName
	 * 		- writable -> activityWritable
	 */
	Ext.define('CMDBuild.proxy.management.workflow.panel.tree.Reader', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.workflowstore',

		requires: [
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @param {Object} activityObject
		 *
		 * @returns {Object} activityNewObject
		 *
		 * @private
		 */
		buildNodeActivity: function (activityObject, parentObject) {
			if (Ext.isObject(activityObject)) {
				var activityNewObject = {};

				// Workflow attributes
				activityNewObject[CMDBuild.core.constants.Proxy.CARD_ID] = parentObject[CMDBuild.core.constants.Proxy.ID];
				activityNewObject[CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION] = parentObject[CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION];
				activityNewObject[CMDBuild.core.constants.Proxy.CLASS_ID] = parentObject[CMDBuild.core.constants.Proxy.CLASS_ID];
				activityNewObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = parentObject[CMDBuild.core.constants.Proxy.CLASS_NAME];
				activityNewObject[CMDBuild.core.constants.Proxy.VALUES] = parentObject[CMDBuild.core.constants.Proxy.VALUES];

				// Activity attributes
				activityNewObject[CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION] = activityObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
				activityNewObject[CMDBuild.core.constants.Proxy.ACTIVITY_ID] = activityObject[CMDBuild.core.constants.Proxy.ID];
				activityNewObject[CMDBuild.core.constants.Proxy.ACTIVITY_METADATA] = activityObject[CMDBuild.core.constants.Proxy.METADATA];
				activityNewObject[CMDBuild.core.constants.Proxy.ACTIVITY_PERFORMER_NAME] = activityObject[CMDBuild.core.constants.Proxy.PERFORMER_NAME];
				activityNewObject[CMDBuild.core.constants.Proxy.ACTIVITY_WRITABLE] = activityObject[CMDBuild.core.constants.Proxy.WRITABLE];

				// Commons
				activityNewObject[CMDBuild.core.constants.Proxy.LEAF] = true;
				activityNewObject['rawData'] = parentObject; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

				return activityNewObject;
			}
		},

		/**
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowObject
		 *
		 * @private
		 */
		buildNodeWorkflowInstanceMultipleActivity: function (rowObject) {
			if (
				Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)
				&& Ext.isArray(rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST]) && !Ext.isEmpty(rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST])
			) {
				var activityInfoList = rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST];
				var children = [];

				Ext.Array.each(activityInfoList, function (activityInfoObject, i, allActivityInfoObjects) {
					if (Ext.isObject(activityInfoObject) && !Ext.Object.isEmpty(activityInfoObject))
						children.push(this.buildNodeActivity(activityInfoObject, rowObject));
				}, this);

				rowObject[CMDBuild.core.constants.Proxy.CARD_ID] = rowObject[CMDBuild.core.constants.Proxy.ID];
				rowObject[CMDBuild.core.constants.Proxy.LEAF] = activityInfoList.length < 2;
				rowObject['rawData'] = rowObject; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

				// Sort by ActivityDescription alphabetically (ASC)
				rowObject[CMDBuild.core.constants.Proxy.CHILDREN] = CMDBuild.core.Utils.objectArraySort(children, CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION);

				return rowObject;
			}
		},

		/**
		 * Completed or aborted processes
		 *
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowObject
		 *
		 * @private
		 */
		buildNodeWorkflowInstanceNoActivity: function (rowObject) {
			if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)) {
				var activityNewObject = this.buildNodeActivity({}, rowObject);
				activityNewObject['rawData'] = rowObject; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

				return activityNewObject;
			}
		},

		/**
		 * Join activity data to workflow instance data
		 *
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowObject
		 *
		 * @private
		 */
		buildNodeWorkflowInstanceSingleActivity: function (rowObject) {
			if (
				Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)
				&& Ext.isArray(rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST]) && !Ext.isEmpty(rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST])
			) {
				var activityNewObject = this.buildNodeActivity(
					rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST][0],
					rowObject
				);
				activityNewObject['rawData'] = rowObject; // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor

				return activityNewObject;
			}
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Ext.data.ResultSet}
		 *
		 * @override
		 */
		readRecords: function (data) {
			data = data[CMDBuild.core.constants.Proxy.RESPONSE][CMDBuild.core.constants.Proxy.ROWS];

			var structure = [];

			if (Ext.isArray(data) && !Ext.isEmpty(data))
				Ext.Array.each(data, function (rowObject, i, allRowObjects) {
					var activityInfoList = rowObject[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_INFO_LIST];

					if (Ext.isArray(activityInfoList))
						if (activityInfoList.length == 1) {
							structure.push(this.buildNodeWorkflowInstanceSingleActivity(rowObject));
						} else if (activityInfoList.length > 1) {
							structure.push(this.buildNodeWorkflowInstanceMultipleActivity(rowObject));
						} else if (Ext.isEmpty(activityInfoList)) {
							structure.push(this.buildNodeWorkflowInstanceNoActivity(rowObject));
						}
				}, this);

			return this.callParent([structure]);
		}
	});

})();
