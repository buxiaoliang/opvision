(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link GISLayerModel
	 */
	Ext.define('CMDBuild.model.classes.tabs.geoAttributes.Attribute', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CARD_BINDING, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FULL_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.INDEX, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MAX_ZOOM, type: 'int', defaultValue: 25 },
			{ name: CMDBuild.core.constants.Proxy.MIN_ZOOM, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.STYLE, type: 'auto', defaultValue: {} }, // CMDBuild.model.classes.tabs.geoAttributes.Style
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VISIBILITY, type: 'auto', defaultValue: [] }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.STYLE] = Ext.create('CMDBuild.model.classes.tabs.geoAttributes.Style', Ext.decode(data[CMDBuild.core.constants.Proxy.STYLE]));

			this.callParent(arguments);
		}
	});

})();
