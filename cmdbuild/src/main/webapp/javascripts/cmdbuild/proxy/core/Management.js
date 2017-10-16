(function () {

	Ext.define('CMDBuild.proxy.core.Management', {

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
		readAllDomains: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTRY_TYPE, parameters);
		}
	});

})();
