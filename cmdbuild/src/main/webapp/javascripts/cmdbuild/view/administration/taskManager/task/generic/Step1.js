(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.generic.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Step1}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.Checkbox}
		 */
		activeField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		descriptionField: undefined,

		/**
		 * @property {Ext.form.field.Hidden}
		 */
		idField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		typeField: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		defaults: {
			maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
			anchor: '100%'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.typeField = Ext.create('Ext.form.field.Text', {
						fieldLabel: CMDBuild.Translation.type,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						name: CMDBuild.core.constants.Proxy.TYPE,
						value: CMDBuild.Translation.others,
						disabled: true,
						cmImmutable: true,
						readOnly: true,
						submitValue: false
					}),
					this.descriptionField = Ext.create('Ext.form.field.Text', {
						name: CMDBuild.core.constants.Proxy.DESCRIPTION,
						fieldLabel: CMDBuild.Translation.descriptionLabel,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						allowBlank: false
					}),
					this.activeField = Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.ACTIVE,
						fieldLabel: CMDBuild.Translation.startOnSave,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
					}),
					this.idField = Ext.create('Ext.form.field.Hidden', { name: CMDBuild.core.constants.Proxy.ID })
				]
			});

			this.callParent(arguments);
		}
	});

})();
