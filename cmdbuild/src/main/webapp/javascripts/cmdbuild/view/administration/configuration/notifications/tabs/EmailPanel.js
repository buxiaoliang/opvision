(function () {

	Ext.define('CMDBuild.view.administration.configuration.notifications.tabs.EmailPanel', {
		extend: 'Ext.form.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.configuration.notifications.tabs.Email'
		],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.notifications.tabs.Email}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.field.comboBox.Erasable}
		 */
		fieldAccount: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		fieldDestination: undefined,

		/**
		 * @property {CMDBuild.view.common.field.comboBox.Erasable}
		 */
		fieldTemplate: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		frame: false,
		overflowY: 'auto',
		title: CMDBuild.Translation.email,

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
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onConfigurationNotificationsSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onConfigurationNotificationsAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.ENABLED,
						fieldLabel: CMDBuild.Translation.enabled,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL_CONFIGURATION,
						inputValue: true,
						uncheckedValue: false
					}),
					this.fieldTemplate = Ext.create('CMDBuild.view.common.field.comboBox.Erasable', {
						name: CMDBuild.core.constants.Proxy.TEMPLATE,
						fieldLabel: CMDBuild.Translation.notificationEmailTemplate,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL_CONFIGURATION,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						valueField: CMDBuild.core.constants.Proxy.NAME,
						maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_MEDIUM,
						forceSelection: true,

						store: CMDBuild.proxy.administration.configuration.notifications.tabs.Email.getStoreTemplate(),
						queryMode: 'local',

						listeners: {
							scope: this,
							select: function (field, records, eOpts) {
								this.delegate.cmfg('onConfigurationNotificationsTabEmailTemplateSelect');
							}
						}
					}),
					this.fieldAccount = Ext.create('CMDBuild.view.common.field.comboBox.Erasable', {
						name: CMDBuild.core.constants.Proxy.ACCOUNT,
						fieldLabel: CMDBuild.Translation.notificationEmailAccount,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL_CONFIGURATION,
						displayField: CMDBuild.core.constants.Proxy.NAME,
						valueField: CMDBuild.core.constants.Proxy.NAME,
						maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_MEDIUM,
						forceSelection: true,

						store: CMDBuild.proxy.administration.configuration.notifications.tabs.Email.getStoreAccount(),
						queryMode: 'local'
					}),
					this.fieldDestination = Ext.create('Ext.form.field.Text', {
						name: CMDBuild.core.constants.Proxy.DESTINATION,
						fieldLabel: CMDBuild.Translation.destinationEmailAddress,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL_CONFIGURATION,
						maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
						vtype: 'email'
					}),
					Ext.create('Ext.form.field.Number', {
						name: CMDBuild.core.constants.Proxy.TIME_INTERVAL,
						fieldLabel: CMDBuild.Translation.timeInterval,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL_CONFIGURATION,
						maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_MEDIUM,
						allowDecimals: false,
						minValue: 0
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onConfigurationNotificationsTabEmailShow');
			}
		}
	});

})();
