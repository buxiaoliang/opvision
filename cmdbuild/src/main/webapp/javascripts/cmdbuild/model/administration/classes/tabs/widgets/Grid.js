(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.classes.tabs.widgets.Grid', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
		]
	});

})();
