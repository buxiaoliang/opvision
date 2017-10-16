(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.workflow.Step1', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.workflow.Workflow}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.workflow.Step1}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.workflow.Step1', { delegate: this });
		},

		/**
		 * @return {String}
		 */
		checkWorkflowComboSelected: function () {
			return this.getWorkflowDelegate().getValueCombo();
		},

		// GETters functions
			/**
			 * @return {String}
			 */
			getValueId: function () {
				return this.view.idField.getValue();
			},

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
		 * To erase workflow form used on addButtonClick
		 */
		eraseWorkflowForm: function () {
			this.getWorkflowDelegate().eraseWorkflowForm();
		},

		// SETters functions
			/**
			 * @param {Boolean} state
			 */
			setDisabledTypeField: function (state) {
				this.view.typeField.setDisabled(state);
			},

			/**
			 * @param {Boolean} state
			 */
			setDisabledWorkflowAttributesGrid: function (state) {
				this.getWorkflowDelegate().setDisabledAttributesGrid(state);
			},

			/**
			 * @param {String} value
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
			 * @param {String} value
			 */
			setValueId: function (value) {
				this.view.idField.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueWorkflowAttributesGrid: function (value) {
				this.getWorkflowDelegate().setValueGrid(value);
			},

			/**
			 * @param {String} value
			 */
			setValueWorkflowCombo: function (value) {
				this.getWorkflowDelegate().setValueCombo(value);
			}
	});

})();
