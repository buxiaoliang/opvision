(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.Ping', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.classes.tabs.widgets.ping.Definition'
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
			'classesTabWidgetsWidgetPingDefinitionGet = classesTabWidgetsWidgetDefinitionGet',
			'classesTabWidgetsWidgetPingLoadRecord = classesTabWidgetsWidgetLoadRecord'
		],

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: 'CMDBuild.model.administration.classes.tabs.widgets.ping.Definition',

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.widgets.form.PingPanel}
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

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.PingPanel', { delegate: this });
		},

		/**
		 * @returns {Object} widgetDefinition
		 */
		classesTabWidgetsWidgetPingDefinitionGet: function () {
			var widgetDefinition = CMDBuild.model.administration.classes.tabs.widgets.ping.Definition.convertToLegacy(
				Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet'), this.view.getData(true)).getData()
			);
			widgetDefinition[CMDBuild.core.constants.Proxy.TEMPLATES] = this.view.presetGrid.getData(CMDBuild.core.constants.Proxy.DATA);

			return widgetDefinition;
		},

		/**
		 * Fills form with widget data
		 *
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.ping.Definition} record
		 *
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetPingLoadRecord: function (record) {
			this.view.loadRecord(record);
			this.view.presetGrid.setData(record.get(CMDBuild.core.constants.Proxy.TEMPLATES));
		}
	});

})();
