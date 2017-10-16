(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.email.Step4', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Email}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.email.Step4}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.email.Email} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.email.Step4', { delegate: this });
		},

		/**
		 * @return {String}
		 */
		checkWorkflowComboSelected: function () {
			return this.getWorkflowDelegate().getValueCombo();
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.workflowForm.CMWorkflowFormController} delegate
			 */
			getWorkflowDelegate: function () {
				return this.view.workflowForm.delegate;
			},

			/**
			 * @return {Object}
			 */
			getValueWorkflowAttributeGrid: function () {
				return this.getWorkflowDelegate().getValueGrid();
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
