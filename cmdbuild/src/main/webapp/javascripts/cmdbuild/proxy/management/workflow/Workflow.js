(function () {

	Ext.define('CMDBuild.proxy.management.workflow.Workflow', {

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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAttributes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attribute.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ATTRIBUTE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readDefaultFilter: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.defaults.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DEFAULT_FILTER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readStart: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.activity.readStart });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVITY, parameters);
		}
	});

})();
