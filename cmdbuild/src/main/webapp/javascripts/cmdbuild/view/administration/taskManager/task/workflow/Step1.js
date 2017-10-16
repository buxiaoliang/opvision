(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.workflow.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.workflow.Step1}
		 */
		delegate: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			this.typeField = Ext.create('Ext.form.field.Text', {
				fieldLabel: CMDBuild.Translation.type,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: CMDBuild.core.constants.Proxy.TYPE,
				value: CMDBuild.Translation.workflow,
				maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
				anchor: '100%',
				disabled: true,
				cmImmutable: true,
				readOnly: true,
				submitValue: false
			});

			this.idField = Ext.create('Ext.form.field.Hidden', {
				name: CMDBuild.core.constants.Proxy.ID
			});

			this.descriptionField = Ext.create('Ext.form.field.Text', {
				name: CMDBuild.core.constants.Proxy.DESCRIPTION,
				fieldLabel: CMDBuild.Translation.descriptionLabel,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
				anchor: '100%',
				allowBlank: false
			});

			this.activeField = Ext.create('Ext.form.field.Checkbox', {
				name: CMDBuild.core.constants.Proxy.ACTIVE,
				fieldLabel: CMDBuild.Translation.startOnSave,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
				anchor: '100%'
			});

			this.workflowForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.workflowForm.WorkflowFormView', {
				combo: {
					name: CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME
				},
				widthFixDisable: false
			});

			Ext.apply(this, {
				items: [
					this.typeField,
					this.idField,
					this.descriptionField,
					this.activeField,
					this.workflowForm
				]
			});

			this.callParent(arguments);
		}
	});

})();
