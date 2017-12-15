(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.Workflow', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.widgets.Workflow',
			'CMDBuild.model.administration.classes.tabs.widgets.workflow.Definition'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesTabWidgetsWidgetAdd',
			'classesTabWidgetsWidgetDefinitionModelNameGet',
			'classesTabWidgetsWidgetWorkflowDefinitionGet = classesTabWidgetsWidgetDefinitionGet',
			'classesTabWidgetsWidgetWorkflowLoadRecord = classesTabWidgetsWidgetLoadRecord',
			'onClassesTabWidgetsWidgetWorkflowFilterTypeChange',
			'onClassesTabWidgetsWidgetWorkflowSelectedWorkflowChange'
		],

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: 'CMDBuild.model.administration.classes.tabs.widgets.workflow.Definition',

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.widgets.form.WorkflowPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.tabs.widgets.Widgets} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.WorkflowPanel', { delegate: this });
		},

		/**
		 * @returns {Object} widgetDefinition
		 */
		classesTabWidgetsWidgetWorkflowDefinitionGet: function () {
			var widgetDefinition = CMDBuild.model.administration.classes.tabs.widgets.workflow.Definition.convertToLegacy(
				Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet'), this.view.getData(true)).getData()
			);

			switch (widgetDefinition[CMDBuild.core.constants.Proxy.FILTER_TYPE]) {
				case CMDBuild.core.constants.Proxy.NAME: {
					widgetDefinition[CMDBuild.core.constants.Proxy.PRESET] = this.view.presetGrid.getData(CMDBuild.core.constants.Proxy.DATA);
				}
			}

			return widgetDefinition;
		},

		/**
		 * Fills form with widget data
		 *
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.workflow.Definition} record
		 *
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetWorkflowLoadRecord: function (record) {
			this.view.loadRecord(record);

			switch (record.get(CMDBuild.core.constants.Proxy.FILTER_TYPE)) {
				case CMDBuild.core.constants.Proxy.CQL: {
					this.view.filter.setValue(record.get(CMDBuild.core.constants.Proxy.FILTER));
				} break;

				case CMDBuild.core.constants.Proxy.NAME: {
					this.view.workflow.setValue(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_NAME));
					this.view.presetGrid.setData(record.get(CMDBuild.core.constants.Proxy.PRESET));
				} break;
			}
		},

		/**
		 * @param {String} selectedType
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsWidgetWorkflowFilterTypeChange: function (selectedType) {
			switch (selectedType) {
				case CMDBuild.core.constants.Proxy.CQL: {
					this.view.additionalProperties.removeAll();
					this.view.additionalProperties.add(this.view.widgetDefinitionFormAdditionalPropertiesByCqlGet());
				} break;

				case CMDBuild.core.constants.Proxy.NAME: {
					this.view.additionalProperties.removeAll();
					this.view.additionalProperties.add(this.view.widgetDefinitionFormAdditionalPropertiesByNameGet());
				} break;
			}
		},

		/**
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.workflow.TargetWorkflow} selectedRecord
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsWidgetWorkflowSelectedWorkflowChange: function (selectedRecord) {
			if (Ext.isObject(selectedRecord) && !Ext.Object.isEmpty(selectedRecord)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_ID] = selectedRecord.get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.classes.tabs.widgets.Workflow.readStartActivity({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE][CMDBuild.core.constants.Proxy.VARIABLES];

						var data = {};

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
							Ext.Array.each(decodedResponse, function (valueObject, i, allValueObjects) {
								if (!Ext.Object.isEmpty(valueObject))
									data[valueObject[CMDBuild.core.constants.Proxy.NAME]] = '';
							}, this);

						this.view.presetGrid.reset();
						this.view.presetGrid.setData(data);
					}
				});
			}
		}
	});

})();
