(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.task.connector.AttributeLevel', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.IS_KEY, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_NAME, type: 'string' }
		]
	});

})();
