(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.task.connector.ClassLevel', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CREATE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.DELETE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.DELETE_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.UPDATE, type: 'boolean', defaultValue: true }
		]
	});

})();
