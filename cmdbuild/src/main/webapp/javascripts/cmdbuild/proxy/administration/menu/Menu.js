(function () {

	Ext.define('CMDBuild.proxy.administration.menu.Menu', {

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
		readAllGroups: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters);
		}
	});

})();
