(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.OpenReport', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.widgets.OpenReport',
			'CMDBuild.model.administration.classes.tabs.widgets.openReport.Definition'
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
			'classesTabWidgetsWidgetOpenReportDefinitionGet = classesTabWidgetsWidgetDefinitionGet',
			'classesTabWidgetsWidgetOpenReportLoadRecord = classesTabWidgetsWidgetLoadRecord',
			'onClassesTabWidgetsWidgetOpenReportReportSelect'
		],

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: 'CMDBuild.model.administration.classes.tabs.widgets.openReport.Definition',

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.widgets.form.OpenReportPanel}
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

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.OpenReportPanel', { delegate: this });
		},

		/**
		 * @returns {Object} widgetDefinition
		 */
		classesTabWidgetsWidgetOpenReportDefinitionGet: function () {
			var widgetDefinition = CMDBuild.model.administration.classes.tabs.widgets.openReport.Definition.convertToLegacy(
				Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet'), this.view.getData(true)).getData()
			);
			widgetDefinition[CMDBuild.core.constants.Proxy.PRESET] = this.presetGridGet(CMDBuild.core.constants.Proxy.DATA);
			widgetDefinition[CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES] = this.presetGridGet(CMDBuild.core.constants.Proxy.READ_ONLY);

			return widgetDefinition;
		},

		/**
		 * Fills form with widget data
		 *
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.openReport.Definition} record
		 *
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetOpenReportLoadRecord: function (record) {
			this.view.loadRecord(record);
			this.view.forceFormat.setValue(record.get(CMDBuild.core.constants.Proxy.FORCE_FORMAT));
			this.view.reportCode.setValue(record.get(CMDBuild.core.constants.Proxy.REPORT_CODE));

			// Find selected report ID and manually calls onClassesTabWidgetsWidgetOpenReportReportSelect to fill presetGrid
			this.view.reportCode.getStore().on('load', function (store, records, successful, eOpts) {
				var storeReportIndex = store.find(CMDBuild.core.constants.Proxy.TITLE, record.get(CMDBuild.core.constants.Proxy.REPORT_CODE));

				if(storeReportIndex >= 0)
					this.cmfg('onClassesTabWidgetsWidgetOpenReportReportSelect', {
						presets: record.get(CMDBuild.core.constants.Proxy.PRESET),
						readOnlyAttributes: record.get(CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES),
						selectedReport: store.getAt(storeReportIndex)
					});
			}, this);

			this.presetGridLoadData(record.get(CMDBuild.core.constants.Proxy.PRESET), record.get(CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES));
		},

		/**
		 * @param {Array} attributes
		 *
		 * @returns {Object} out
		 *
		 * @private
		 */
		cleanServerAttributes: function (attributes) {
			var out = {};

			for (var i = 0; i < attributes.length; ++i) {
				var attr = attributes[i];

				out[attr.name] = '';
			}

			return out;
		},

		/**
		 * Calls presetGridLoadData to fill presetGrid store with empty fields and then recall for fill with real data
		 *
		 * @param {Object} parameters
		 * @param {Object} parameters.presets
		 * @param {Object} parameters.readOnlyAttributes
		 * @param {Object} parameters.selectedReport
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsWidgetOpenReportReportSelect: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isObject(parameters.selectedReport) && !Ext.Object.isEmpty(parameters.selectedReport)
				&& Ext.isFunction(parameters.selectedReport.get)
			) {
				parameters.presets = Ext.isEmpty(parameters.presets) ? {} : parameters.presets;
				parameters.readOnlyAttributes = Ext.isEmpty(parameters.readOnlyAttributes) ? [] : parameters.readOnlyAttributes;

				var params = {};
				params[CMDBuild.core.constants.Proxy.EXTENSION] = CMDBuild.core.constants.Proxy.PDF;
				params[CMDBuild.core.constants.Proxy.ID] = parameters.selectedReport.get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.TYPE] = 'CUSTOM';

				CMDBuild.proxy.administration.classes.tabs.widgets.OpenReport.create({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						var data = decodedResponse['filled'] ? {} : this.cleanServerAttributes(decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTE]);

						// Reset presetGrid store
						this.view.presetGrid.getStore().removeAll();

						this.presetGridLoadData(data);

						if (!Ext.Object.isEmpty(parameters.presets))
							this.presetGridLoadData(parameters.presets, parameters.readOnlyAttributes);
					}
				});
			}
		},

		/**
		 * @param {String} attribute
		 *
		 * @returns {Mixed}
		 *
		 * @private
		 */
		presetGridGet: function (attribute) {
			switch (attribute) {
				case CMDBuild.core.constants.Proxy.DATA:
					return this.presetGridGetData();

				case CMDBuild.core.constants.Proxy.READ_ONLY:
					return this.presetGridGetReadOnly();

				default:
					return {};
			}
		},

		/**
		 * @returns {Object} data
		 *
		 * @private
		 */
		presetGridGetData: function () {
			return this.view.presetGrid.getData(true);
		},

		/**
		 * @returns {Array} readOnly
		 *
		 * @private
		 */
		presetGridGetReadOnly: function () {
			var readOnly = [];

			Ext.Array.each(this.view.presetGrid.getStore().getRange(), function (record, i, allRecords) {
				if (
					!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.NAME))
					&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.VALUE))
					&& record.get(CMDBuild.core.constants.Proxy.READ_ONLY)
				) {
					readOnly.push(record.get(CMDBuild.core.constants.Proxy.NAME));
				}
			}, this);

			return readOnly;
		},

		/**
		 * PresetGrid setData() override
		 *
		 * @param {Object} data - Ex. { name: value }
		 * @param {Array} readOnlyAttributes
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		presetGridLoadData: function (data, readOnlyAttributes) {
			readOnlyAttributes = Ext.isEmpty(readOnlyAttributes) ? [] : readOnlyAttributes;

			if (!Ext.Object.isEmpty(data)) {
				var formattedDataObject = [];

				Ext.Object.each(data, function (key, value, myself) {
					// Remove already existing rows
					var storeReportIndex = this.view.presetGrid.getStore().find(CMDBuild.core.constants.Proxy.NAME, key);

					if (storeReportIndex >= 0)
						this.view.presetGrid.getStore().removeAt(storeReportIndex);

					// Add data objects to store
					var modelObject = {};
					modelObject[CMDBuild.core.constants.Proxy.NAME] = key;
					modelObject[CMDBuild.core.constants.Proxy.READ_ONLY] = Ext.Array.contains(readOnlyAttributes, key);
					modelObject[CMDBuild.core.constants.Proxy.VALUE] = value;

					formattedDataObject.push(Ext.create('CMDBuild.model.administration.classes.tabs.widgets.openReport.PresetGrid', modelObject));
				}, this);

				this.view.presetGrid.getStore().loadRecords(formattedDataObject, { addRecords: true });
			}
		}
	});

})();
