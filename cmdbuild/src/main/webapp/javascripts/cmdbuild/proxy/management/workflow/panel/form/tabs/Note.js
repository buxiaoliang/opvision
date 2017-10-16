(function () {

	Ext.define('CMDBuild.proxy.management.workflow.panel.form.tabs.Note', {

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
		lock: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.activity.lock });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		unlock: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.activity.unlock });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.activity.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVITY, parameters, true);
		}
	});

})();
