(function () {

	Ext.define('CMDBuild.proxy.gis.Gis', {

		requires: [
			'CMDBuild.core.configurations.Timeout',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		configurationRead: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.params[CMDBuild.core.constants.Proxy.NAME] = 'gis';

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.configuration.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CONFIGURATION, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		configurationUpdate: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.params[CMDBuild.core.constants.Proxy.NAME] = 'gis';

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.configuration.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CONFIGURATION, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		expandDomainTree: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				timeout: CMDBuild.core.configurations.Timeout.getGisTreeExpand(),
				url: CMDBuild.proxy.index.Json.gis.expandDomainTree
			});

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		getFeature: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.getFeatures });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters);
		}
	});

})();
