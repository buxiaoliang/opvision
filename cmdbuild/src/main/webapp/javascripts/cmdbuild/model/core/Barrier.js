(function () {

	Ext.require(['CMDBuild.core.constants.Proxy']);

	Ext.define('CMDBuild.model.core.Barrier', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CALLBACK, type: 'auto', defaultValue: Ext.emptyFn },
			{ name: CMDBuild.core.constants.Proxy.FAILURE, type: 'auto', defaultValue: Ext.emptyFn },
			{ name: CMDBuild.core.constants.Proxy.INDEX, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.SCOPE, type: 'auto', defaultValue: {} }
		]
	});

})();
