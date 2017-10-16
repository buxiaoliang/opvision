(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.email.Step4', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Step4}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		workflowFieldset: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.workflowForm.WorkflowFormView}
		 */
		workflowForm: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		initComponent: function () {
			this.workflowForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.workflowForm.WorkflowFormView', {
				combo: {
					name: CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME
				}
			});

			this.workflowFieldset = Ext.create('Ext.form.FieldSet', {
				title: CMDBuild.Translation.startProcess,
				checkboxName: CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE,
				checkboxToggle: true,
				collapsed: true,
				collapsible: true,
				toggleOnTitleClick: true,
				overflowY: 'auto',

				items: [this.workflowForm]
			});

			this.workflowFieldset.fieldWidthsFix();

			Ext.apply(this, {
				items: [this.workflowFieldset]
			});

			this.callParent(arguments);
		}
	});

})();
