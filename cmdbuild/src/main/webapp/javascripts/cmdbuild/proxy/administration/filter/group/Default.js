(function () {

	Ext.define('CMDBuild.proxy.administration.filter.group.Default', {

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
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.defaults.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.defaults.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters, true);
		}
	});

})();
