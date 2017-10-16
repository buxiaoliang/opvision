(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.generic.Step4', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Generic}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.generic.Step4}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.generic.Generic} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.generic.Step4', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.notificationForm.CMNotificationFormController} delegate
			 */
			getEmailDelegate: function () {
				return this.view.emailForm.delegate;
			},

		// SETters functions
			/**
			 * @param {String} value
			 */
			setValueEmailAccount: function(value) {
				this.getEmailDelegate().setValue('sender', value);
			},

			/**
			 * @param {String} value
			 */
			setValueEmailTemplate: function (value) {
				this.getEmailDelegate().setValue('template', value);
			}
	});

})();
