(function () {

	Ext.define('CMDBuild.proxy.management.workflow.panel.form.tabs.Relations', {

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
		readAll: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.relation.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.RELATION, parameters);
		}
	});

})();
