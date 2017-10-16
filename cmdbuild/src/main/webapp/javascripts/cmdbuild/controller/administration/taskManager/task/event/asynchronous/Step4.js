(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step4', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.event.asynchronous.Step4}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.event.asynchronous.Step4', { delegate: this });
		},

		/**
		 * @return {String}
		 */
		checkWorkflowComboSelected: function () {
			return this.getValueWorkflowCombo();
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.notificationForm.CMNotificationFormController} delegate
			 */
			getNotificationDelegate: function () {
				return this.view.notificationForm.delegate;
			},

			/**
			 * @return {CMDBuild.controller.administration.tasks.common.workflowForm.CMWorkflowFormController} delegate
			 */
			getWorkflowDelegate: function () {
				return this.view.workflowForm.delegate;
			},

			/**
			 * @return {Boolean}
			 */
			getValueNotificationFieldsetCheckbox: function () {
				return this.view.notificationFieldset.checkboxCmp.getValue();
			},

			/**
			 * @return {Object}
			 */
			getValueWorkflowAttributeGrid: function () {
				return this.getWorkflowDelegate().getValueGrid();
			},

			/**
			 * @return {String}
			 */
			getValueWorkflowCombo: function () {
				return this.getWorkflowDelegate().getValueCombo();
			},

			/**
			 * @return {Boolean}
			 */
			getValueWorkflowFieldsetCheckbox: function () {
				return this.view.workflowFieldset.checkboxCmp.getValue();
			},

		/**
		 * To erase workflow form used on addButtonClick
		 */
		eraseWorkflowForm: function () {
			this.getWorkflowDelegate().eraseWorkflowForm();
		},

		// SETters functions
			/**
			 * @param {Boolean} state
			 */
			setDisabledWorkflowAttributesGrid: function (state) {
				this.getWorkflowDelegate().setDisabledAttributesGrid(state);
			},

			/**
			 * @param {String} value
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
			},

			/**
			 * @param {Object} value
			 */
			setValueWorkflowAttributesGrid: function (value) {
				this.getWorkflowDelegate().setValueGrid(value);
			},

			/**
			 * @param {String} value
			 */
			setValueWorkflowCombo: function (value) {
				this.getWorkflowDelegate().setValueCombo(value);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueWorkflowFieldsetCheckbox: function (state) {
				if (state) {
					this.view.workflowFieldset.expand();
				} else {
					this.view.workflowFieldset.collapse();
				}
			}
	});

})();
