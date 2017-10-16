(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.connector.Step3', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Connector'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Step3}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		dbAddressField: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		dbFieldset: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		dbInstanceNameField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		dbNameField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		dbPasswordField: undefined,

		/**
		 * @property {Ext.form.field.Number}
		 */
		dbPortField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		dbSourceFilterField: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		dbTypeCombo: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		dbUsernameField: undefined,

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
			var me = this;

			// DataSource: relationa databases configuration
				this.dbTypeCombo = Ext.create('Ext.form.field.ComboBox', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_TYPE,
					fieldLabel: CMDBuild.Translation.type,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					displayField: CMDBuild.core.constants.Proxy.VALUE,
					valueField: CMDBuild.core.constants.Proxy.KEY,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					forceSelection: true,
					editable: false,
					anchor: '100%',

					store: CMDBuild.proxy.administration.taskManager.task.Connector.getStoreDbTypes(),
					queryMode: 'local',

					listeners: {
						select: function (combo, records, options) {
							me.delegate.cmfg('onSelectDbType', this.getValue());
						}
					}
				});

				this.dbAddressField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_ADDRESS,
					fieldLabel: CMDBuild.Translation.address,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbPortField = Ext.create('Ext.form.field.Number', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_PORT,
					fieldLabel: CMDBuild.Translation.port,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					minValue: 1,
					maxValue: 65535,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_SMALL,
					allowDecimals: false,
					anchor: '100%'
				});

				this.dbNameField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_NAME,
					fieldLabel: CMDBuild.Translation.databaseName,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbInstanceNameField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_INSATANCE_NAME,
					fieldLabel: CMDBuild.Translation.instance,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbUsernameField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_USERNAME,
					fieldLabel: CMDBuild.Translation.username,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbPasswordField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_DB_PASSWORD,
					inputType: 'password',
					fieldLabel: CMDBuild.Translation.password,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbSourceFilterField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.DATASOURCE_TABLE_VIEW_PREFIX,
					fieldLabel: CMDBuild.Translation.entityFilter,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					anchor: '100%'
				});

				this.dbFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.datasourceRelationalDatabase,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,

					items: [
						this.dbTypeCombo,
						this.dbAddressField,
						this.dbPortField,
						this.dbNameField,
						this.dbInstanceNameField,
						this.dbUsernameField,
						this.dbPasswordField,
						this.dbSourceFilterField
					],

					listeners: {
						beforeexpand: function (fieldset, eOpts) {
							me.delegate.cmfg('onDbFieldsetExpand');
						}
					}
				});

				this.dbFieldset.fieldWidthsFix();
			// END - DataSource: relationa databases configuration

			// DataSource: LDAP configuration
				this.ldapAddressField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.ADDRESS,
					fieldLabel: CMDBuild.Translation.address,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					width: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					allowBlank: false
				});

				this.ldapUsernameField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.USERNAME,
					fieldLabel: CMDBuild.Translation.username,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					width: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					allowBlank: false
				});

				this.ldapPasswordField = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.PASSWORD,
					inputType: 'password',
					fieldLabel: CMDBuild.Translation.password,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					width: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
					allowBlank: false
				});

				this.ldapFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.datasourceLdapDirectory,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,

					items: [
						this.ldapAddressField,
						this.ldapUsernameField,
						this.ldapPasswordField
					],

					listeners: {
						beforeexpand: function (fieldset, eOpts) {
							me.delegate.cmfg('onLdapFieldsetExpand');
						}
					}
				});

				this.ldapFieldset.fieldWidthsFix();
			// END - DataSource: LDAP configuration

			Ext.apply(this, {
				items: [
					this.dbFieldset
// TODO: future implementation
//					,
//					this.ldapFieldset
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			/**
			 * Disable instanceNameField
			 */
			activate: function (view, eOpts) {
				this.dbInstanceNameField.setDisabled(true);
			}
		}
	});

})();
