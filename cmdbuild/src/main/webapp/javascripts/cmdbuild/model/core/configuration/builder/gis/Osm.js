(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.Utils'
	]);

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.gis.Osm', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ZOOM_MAX, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.ZOOM_MIN, type: 'int' }
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
			data[CMDBuild.core.constants.Proxy.ENABLED] = CMDBuild.core.Utils.decodeAsBoolean(data['osm']);
			data[CMDBuild.core.constants.Proxy.ZOOM_MAX] = data['osm_maxzoom'];
			data[CMDBuild.core.constants.Proxy.ZOOM_MIN] = data['osm_minzoom'];

			this.callParent(arguments);
		}
	});

})();
