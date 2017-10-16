(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.gis.Gis', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CARD_BROWSER_BY_DOMAIN_CONFIGURATION, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.CENTER_LATITUDE, type: 'float' },
			{ name: CMDBuild.core.constants.Proxy.CENTER_LONGITUDE, type: 'float' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.GEO_SERVER, type: 'auto' }, // {CMDBuild.model.core.configuration.builder.gis.Geoserver}
			{ name: CMDBuild.core.constants.Proxy.GOOGLE, type: 'auto' }, // {CMDBuild.model.core.configuration.builder.gis.Google}
			{ name: CMDBuild.core.constants.Proxy.OSM, type: 'auto' }, // {CMDBuild.model.core.configuration.builder.gis.Osm}
			{ name: CMDBuild.core.constants.Proxy.YAHOO, type: 'auto' }, // {CMDBuild.model.core.configuration.builder.gis.Yahoo}
			{ name: CMDBuild.core.constants.Proxy.INITIAL_ZOOM_LEVEL, type: 'int' }
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
			data[CMDBuild.core.constants.Proxy.CENTER_LATITUDE] = data['center.lat'];
			data[CMDBuild.core.constants.Proxy.CENTER_LONGITUDE] = data['center.lon'];
			data[CMDBuild.core.constants.Proxy.INITIAL_ZOOM_LEVEL] = data['initialZoomLevel'];

			data[CMDBuild.core.constants.Proxy.GEO_SERVER] = Ext.create('CMDBuild.model.core.configuration.builder.gis.Geoserver', Ext.clone(data));
			data[CMDBuild.core.constants.Proxy.GOOGLE] = Ext.create('CMDBuild.model.core.configuration.builder.gis.Google', Ext.clone(data));
			data[CMDBuild.core.constants.Proxy.OSM] = Ext.create('CMDBuild.model.core.configuration.builder.gis.Osm', Ext.clone(data));
			data[CMDBuild.core.constants.Proxy.YAHOO] = Ext.create('CMDBuild.model.core.configuration.builder.gis.Yahoo', Ext.clone(data));

			this.callParent(arguments);
		},

		/**
		 * Override to permits multilevel get with a single function
		 *
		 * @param {Array or String} property
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (property) {
			if (!Ext.isEmpty(property) && Ext.isArray(property)) {
				var returnValue = this;

				Ext.Array.each(property, function (propertyName, i, allPropertyNames) {
					if (!Ext.isEmpty(returnValue) && Ext.isFunction(returnValue.get))
						returnValue = returnValue.get(propertyName);
				}, this);

				return returnValue;
			}

			return this.callParent(arguments);
		}
	});

})();
