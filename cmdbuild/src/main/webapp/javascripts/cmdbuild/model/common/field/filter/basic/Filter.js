(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.field.filter.basic.Filter', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CONFIGURATION, type: 'auto', defaultValue: {} }
		]
	});

})();
