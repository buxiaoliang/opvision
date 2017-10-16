(function () {

	Ext.define('CMDBuild.proxy.management.routes.Classes', {

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
		readClassByName: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readByName });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		}
	});

})();
