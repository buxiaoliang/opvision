(function () {

	Ext.define('CMDBuild.proxy.management.workflow.Instance', {

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
		abort: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.activity.abort });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_INSTANCE, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.instance.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_INSTANCE, parameters);
		}
	});

})();
