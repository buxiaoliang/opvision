(function () {

	Ext.define('CMDBuild.proxy.management.routes.Workflow', {

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
		readByName: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.readByName });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW, parameters);
		}
	});

})();
