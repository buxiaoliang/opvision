(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.task.connector.Connector', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ATTRIBUTE_MAPPING, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.CLASS_MAPPING, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.CRON_EXPRESSION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DATASOURCE_CONFIGURATION, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.DATASOURCE_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE_ERROR, type: 'string' }
		]
	});

})();
