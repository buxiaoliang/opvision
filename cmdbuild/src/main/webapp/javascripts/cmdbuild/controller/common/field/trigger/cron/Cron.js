(function () {

	Ext.define('CMDBuild.controller.common.field.trigger.cron.Cron', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onFieldTriggerCronClick',
			'onFieldTriggerCronValuesSet'
		],

		/**
		 * @property {CMDBuild.controller.common.field.trigger.cron.window.Edit}
		 */
		controllerWindowEdit: undefined,

		/**
		 * @property {CMDBuild.view.common.field.trigger.cron.Cron}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {CMDBuild.view.common.field.trigger.cron.Cron} configObject.view
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			// Controller build
			this.controllerWindowEdit = Ext.create('CMDBuild.controller.common.field.trigger.cron.window.Edit', { parentDelegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onFieldTriggerCronClick: function () {
			if (!this.view.isDisabled())
				this.controllerWindowEdit.cmfg('onFieldTriggerCronWindowEditConfigure', { title: this.view.fieldLabel });
		},

		/**
		 * @param {String} value
		 *
		 * @returns {Void}
		 */
		onFieldTriggerCronValuesSet: function (value) {
			this.view.setValue(value);
		}
	});

})();
