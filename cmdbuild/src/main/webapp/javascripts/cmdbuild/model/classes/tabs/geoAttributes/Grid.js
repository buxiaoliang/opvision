(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link GISLayerModel
	 */
	Ext.define('CMDBuild.model.classes.tabs.geoAttributes.Grid', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME, type: 'string' }, // Used from store filter
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
		]
	});

})();
