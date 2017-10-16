(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step1', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Connector}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.connector.Step1}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.connector.Connector} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.connector.Step1', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.notificationForm.CMNotificationFormController} delegate
			 */
			getNotificationDelegate: function () {
				return this.view.notificationForm.delegate;
			},

			/**
			 * @return {String}
			 */
			getValueId: function () {
				return this.view.idField.getValue();
			},

			/**
			 * @return {Boolean}
			 */
			getValueNotificationFieldsetCheckbox: function () {
				return this.view.notificationFieldset.checkboxCmp.getValue();
			},

		// GETters functions
			/**
			 * @param {Boolean} state
			 */
			setDisabledTypeField: function (state) {
				this.view.typeField.setDisabled(state);
			},

			/**
			 * @param {Boolean} value
			 */
			setValueActive: function (value) {
				this.view.activeField.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueDescription: function (value) {
				this.view.descriptionField.setValue(value);
			},

			/**
			 * @param {Int} value
			 */
			setValueId: function (value) {
				this.view.idField.setValue(value);
			},

			/**
			 * @param {Object} value
			 */
			setValueNotificationAccount: function (value) {
				this.getNotificationDelegate().setValue('sender', value);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueNotificationFieldsetCheckbox: function (state) {
				if (state) {
					this.view.notificationFieldset.expand();
				} else {
					this.view.notificationFieldset.collapse();
				}
			},

			/**
			 * @param {String} value
			 */
			setValueNotificationTemplate: function (value) {
				this.getNotificationDelegate().setValue('template', value);
			}
	});

})();
