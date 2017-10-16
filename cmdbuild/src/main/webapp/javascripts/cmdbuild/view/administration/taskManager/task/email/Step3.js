(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.email.Step3', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Email'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Step3}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		attachmentsCombo: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		attachmentsFieldset: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		notificationFieldset: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView}
		 */
		notificationForm: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		parsingFieldset: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		parsingKeyEnd: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		parsingKeyStart: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		parsingValueEnd: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		parsingValueStart: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		initComponent: function () {
			var me = this;

			// Parsing configuration
				this.parsingKeyStart = Ext.create('Ext.form.field.Text', {
					fieldLabel: CMDBuild.Translation.keyStartDelimeter,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					name: CMDBuild.core.constants.Proxy.PARSING_KEY_INIT,
					flex: 1
				});

				this.parsingKeyEnd = Ext.create('Ext.form.field.Text', {
					fieldLabel: CMDBuild.Translation.keyEndDelimiter,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					name: CMDBuild.core.constants.Proxy.PARSING_KEY_END,
					margin: '0 0 0 20',
					flex: 1
				});

				this.parsingValueStart = Ext.create('Ext.form.field.Text', {
					fieldLabel: CMDBuild.Translation.valueStartDelimeter,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					name: CMDBuild.core.constants.Proxy.PARSING_VALUE_INIT,
					flex: 1
				});

				this.parsingValueEnd = Ext.create('Ext.form.field.Text', {
					fieldLabel: CMDBuild.Translation.valueEndDelimiter,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					name: CMDBuild.core.constants.Proxy.PARSING_VALUE_END,
					margin: '0 0 0 20',
					flex: 1
				});

				this.parsingFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.bodyParsing,
					checkboxName: CMDBuild.core.constants.Proxy.PARSING_ACTIVE,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',

					items: [
						{
							xtype: 'container',

							layout: {
								type: 'hbox',
								align:'stretch'
							},

							items: [this.parsingKeyStart, this.parsingKeyEnd]
						},
						{
							xtype: 'container',
							margin: '10 0',

							layout: {
								type: 'hbox',
								align:'stretch'
							},

							items: [this.parsingValueStart, this.parsingValueEnd]
						}
					]
				});

				this.parsingFieldset.fieldWidthsFix();
			// END: BodyParsing configuration

			// Email notification configuration
				this.notificationForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView', {
					template: {
						type: 'template',
						disabled: false
					}
				});

				this.notificationFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.sendNotificationEmail,
					checkboxName: CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',

					items: [this.notificationForm]
				});

				this.notificationFieldset.fieldWidthsFix();
			// END: Email notification configuration

			// Attachments configuration
				this.attachmentsCombo = Ext.create('Ext.form.field.ComboBox', {
					name: CMDBuild.core.constants.Proxy.ATTACHMENTS_CATEGORY,
					fieldLabel: CMDBuild.Translation.category,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					anchor: '100%',
					displayField: 'Description',
					valueField: 'Id',
					forceSelection: true,
					editable: false,

					store: CMDBuild.proxy.administration.taskManager.task.Email.getStoreLokup(),
					queryMode: 'local'
				});

				this.attachmentsFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.saveAttachmentsToDms,
					checkboxName: CMDBuild.core.constants.Proxy.ATTACHMENTS_ACTIVE,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',

					items: [this.attachmentsCombo],

					listeners: {
						expand: function (fieldset, eOpts) {
							me.delegate.cmfg('onCheckedAttachmentsFieldset');
						}
					}
				});

				this.attachmentsFieldset.fieldWidthsFix();
			// END: Attachments configuration

			Ext.apply(this, {
				items: [
					this.parsingFieldset,
					this.notificationFieldset,
					this.attachmentsFieldset
				]
			});

			this.callParent(arguments);
		}
	});

})();
