(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.connector.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Step1}
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
		 * @property {Ext.form.FieldSet}
		 */
		notificationFieldset: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView}
		 */
		notificationForm: undefined,

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
			this.typeField = Ext.create('Ext.form.field.Text', {
				fieldLabel: CMDBuild.Translation.type,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: CMDBuild.core.constants.Proxy.TYPE,
				value: CMDBuild.Translation.connector,
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
				allowBlank: false
			});

			this.activeField = Ext.create('Ext.form.field.Checkbox', {
				name: CMDBuild.core.constants.Proxy.ACTIVE,
				fieldLabel: CMDBuild.Translation.startOnSave,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
			});

			// Email notification configuration
				this.notificationForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView', {
					sender: {
						type: 'sender',
						disabled: false
					},
					template: {
						type: 'template',
						disabled: false,
						fieldLabel: CMDBuild.Translation.errorEmailTemplate,
						name: CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE_ERROR
					}
				});

				this.notificationFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.sendNotificationEmail,
					checkboxName: CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					maxWidth: '100%',

					items: [this.notificationForm]
				});

				this.notificationFieldset.fieldWidthsFix();
			// END: Email notification configuration

			Ext.apply(this, {
				items: [
					this.typeField,
					this.idField,
					this.descriptionField,
					this.activeField,
					this.notificationFieldset
				]
			});

			this.callParent(arguments);
		}
	});

})();