(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.Utils'
	]);

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.gis.Geoserver', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.PASSWORD, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.URL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.WORKSPACE, type: 'string' },
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
			data[CMDBuild.core.constants.Proxy.ENABLED] = CMDBuild.core.Utils.decodeAsBoolean(data['geoserver']);
			data[CMDBuild.core.constants.Proxy.PASSWORD] = data['geoserver_admin_password'];
			data[CMDBuild.core.constants.Proxy.USER] = data['geoserver_admin_user'];
			data[CMDBuild.core.constants.Proxy.ZOOM_MAX] = data['geoserver_maxzoom'];
			data[CMDBuild.core.constants.Proxy.ZOOM_MIN] = data['geoserver_minzoom'];
			data[CMDBuild.core.constants.Proxy.URL] = data['geoserver_url'];
			data[CMDBuild.core.constants.Proxy.WORKSPACE] = data['geoserver_workspace'];

			this.callParent(arguments);
		}
	});

})();
