(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.task.connector.ReferenceLevel', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DOMAIN_NAME, type: 'string' }
		]
	});

})();
