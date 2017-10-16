(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.core.configuration.builder.Bim', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.PASSWORD, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ROOT_CLASS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.URL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.USERNAME, type: 'string' }
		]
	});

})();
