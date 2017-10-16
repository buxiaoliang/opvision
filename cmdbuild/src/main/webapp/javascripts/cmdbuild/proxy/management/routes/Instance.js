(function () {

	Ext.define('CMDBuild.proxy.management.routes.Instance', {

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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.instance.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_INSTANCE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAll: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.instance.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_INSTANCE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readWorkflowByName: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.readByName });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW, parameters);
		}
	});

})();
