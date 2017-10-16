(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step3', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Connector}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onDbFieldsetExpand',
			'onLdapFieldsetExpand',
			'onSelectDbType'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.connector.Step3}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.connector.Connector} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.connector.Step3', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {Mixed} dataSourceType or false
			 */
			getTypeDataSource: function () {
				if (this.view.dbFieldset.checkboxCmp.getValue())
					return CMDBuild.core.constants.Proxy.DB;

				if (this.view.ldapFieldset.checkboxCmp.getValue())
					return CMDBuild.core.constants.Proxy.LDAP;

				return false;
			},

		onDbFieldsetExpand: function () {
			this.view.ldapFieldset.collapse();
			this.view.ldapFieldset.reset();
		},

		onLdapFieldsetExpand: function () {
			this.view.dbFieldset.collapse();
			this.view.dbFieldset.reset();
		},

		/**
		 * To enable/disable dbInstanceNameField
		 *
		 * @param {String} selectedValue
		 */
		onSelectDbType: function (selectedValue) {
			this.view.dbInstanceNameField.setDisabled(
				!(selectedValue == CMDBuild.core.constants.Proxy.MYSQL)
			);
		},

		// SETters functions
			/**
			 * @param {String} dataSourceType
			 * @param {Object} configurationObject
			 */
			setValueDataSourceConfiguration: function (dataSourceType, configurationObject) {
				if (!Ext.Object.isEmpty(configurationObject))
					switch (dataSourceType) {
						case CMDBuild.core.constants.Proxy.DB: {
							this.view.dbFieldset.expand();

							this.view.dbTypeCombo.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_TYPE]);
							this.view.dbAddressField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_ADDRESS]);
							this.view.dbPortField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PORT]);
							this.view.dbNameField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_NAME]);
							this.view.dbInstanceNameField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_INSATANCE_NAME]);
							this.view.dbUsernameField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_USERNAME]);
							this.view.dbPasswordField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PASSWORD]);
							this.view.dbSourceFilterField.setValue(configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_TABLE_VIEW_PREFIX]);
						} break;

						default:
							_error('CMTasksFormConnectorController: onSaveButtonClick() datasource type not recognized');
					}
			},

		/**
		 * Set dataSource configuration fields as required/unrequired
		 *
		 * @param {Boolean} enable
		 */
		validate: function (enable) {
			this.view.dbTypeCombo.allowBlank = !enable;
			this.view.dbAddressField.allowBlank = !enable;

			this.view.dbPortField.allowBlank = !enable;
			this.view.dbPortField.setMinValue(enable ? 1 : 0);

			this.view.dbNameField.allowBlank = !enable;
			this.view.dbUsernameField.allowBlank = !enable;
			this.view.dbPasswordField.allowBlank = !enable;
		}
	});

})();
