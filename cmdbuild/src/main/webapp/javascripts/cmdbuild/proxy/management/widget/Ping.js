(function () {

	Ext.define('CMDBuild.proxy.management.widget.Ping', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		ping: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.widget.ping });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readClassById: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readById });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		}
	});

})();
