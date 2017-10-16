(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.utility.importCsv.Permissions', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CREATE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.WRITE, type: 'boolean' }
		]
	});

})();
