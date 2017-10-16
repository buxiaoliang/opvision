(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.CronConfiguration}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.common.CronConfiguration', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.cronForm.CMCronFormController} delegate
			 */
			getCronDelegate: function () {
				return this.view.cronForm.delegate;
			},

		// SETters functions
			/**
			 * @param {String} cronExpression
			 */
			setValueAdvancedFields: function (cronExpression) {
				this.getCronDelegate().setValueAdvancedFields(cronExpression);
			},

			/**
			 * @param {String} value
			 */
			setValueBase: function (value) {
				this.getCronDelegate().setValueBase(value);
			}
	});

})();
