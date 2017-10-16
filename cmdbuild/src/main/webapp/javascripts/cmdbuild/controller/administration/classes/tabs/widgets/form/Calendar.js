(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.Calendar', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.classes.tabs.widgets.calendar.Definition'
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
			'classesTabWidgetsWidgetCalendarDefinitionGet = classesTabWidgetsWidgetDefinitionGet',
			'classesTabWidgetsWidgetCalendarLoadRecord = classesTabWidgetsWidgetLoadRecord',
			'classesTabWidgetsWidgetDefinitionModelNameGet',
			'onClassesTabWidgetsWidgetCalendarTargetClassChange'
		],

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: 'CMDBuild.model.administration.classes.tabs.widgets.calendar.Definition',

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.widgets.form.CalendarPanel}
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

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.CalendarPanel', { delegate: this });
		},

		/**
		 * @param {String} selectedClassName
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsWidgetCalendarTargetClassChange: function (selectedClassName) {
			if (Ext.isString(selectedClassName) && !Ext.isEmpty(selectedClassName)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = selectedClassName;

				this.view.startDate.getStore().load({ params: params });
				this.view.endDate.getStore().load({ params: params });
				this.view.defaultDate.getStore().load({ params: params });
				this.view.eventTitle.getStore().load({ params: params });
			}
		},

		/**
		 * @returns {Object}
		 */
		classesTabWidgetsWidgetCalendarDefinitionGet: function () {
			return CMDBuild.model.administration.classes.tabs.widgets.calendar.Definition.convertToLegacy(
				Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet'), this.view.getData(true)).getData()
			);
		},

		/**
		 * Fills form with widget data
		 *
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.calendar.Definition} record
		 *
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetCalendarLoadRecord: function (record) {
			this.view.loadRecord(record);
		}
	});

})();
