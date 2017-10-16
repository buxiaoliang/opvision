(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.generic.Step5', {
		extend: 'CMDBuild.controller.common.abstract.Base',

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
		 * @property {CMDBuild.view.administration.taskManager.task.generic.Step5}
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

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.generic.Step5', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.workflowForm.CMWorkflowFormController} delegate
			 */
			getReportDelegate: function () {
				return this.view.reportForm.delegate;
			},

			/**
			 * @return {Object}
			 */
			getValueReportAttributeGrid: function () {
				return this.getReportDelegate().getValueGrid();
			},

			/**
			 * @return {Boolean}
			 */
			getValueReportFieldsetCheckbox: function () {
				return this.view.reportFieldset.checkboxCmp.getValue();
			},

		// SETters functions
			/**
			 * @param {Object} value
			 */
			setValueReportAttributesGrid: function (value) {
				this.getReportDelegate().setValueGrid(value);
			},

			/**
			 * @param {String} value
			 */
			setValueReportCombo: function (value) {
				this.getReportDelegate().setValueCombo(value);
			},

			/**
			 * @param {String} value
			 */
			setValueReportExtension: function (value) {
				this.getReportDelegate().setValueExtension(value);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueReportFieldsetCheckbox: function (state) {
				if (state) {
					this.view.reportFieldset.expand();
				} else {
					this.view.reportFieldset.collapse();
				}
			}
	});

})();
