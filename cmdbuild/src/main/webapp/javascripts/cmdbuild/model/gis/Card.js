(function () {
	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.gis.Card', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'Id', type: 'string' },
			{ name: 'IdClass', type: 'string' },
			{ name: 'className', type: 'string' }
		]
	});

})();
