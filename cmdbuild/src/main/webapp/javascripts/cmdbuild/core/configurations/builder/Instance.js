(function () {

	Ext.define('CMDBuild.core.configurations.builder.Instance', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.core.configurations.builder.Instance'
		],

		/**
		 * @param {Object} configuration
		 * @param {Function} configuration.callback
		 * @param {Boolean} configuration.enableServerCalls
		 * @param {Object} configuration.scope
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configuration) {
			configuration = Ext.isObject(configuration) ? configuration : {};
			configuration.callback = Ext.isFunction(configuration.callback) ? configuration.callback : Ext.emptyFn;
			configuration.enableServerCalls = Ext.isBoolean(configuration.enableServerCalls) ? configuration.enableServerCalls : true;
			configuration.scope = Ext.isObject(configuration.scope) ? configuration.scope : this;

			Ext.ns('CMDBuild.configuration');
			CMDBuild.configuration.instance = Ext.create('CMDBuild.model.core.configuration.builder.Instance'); // Instance configuration model with defaults

			if (configuration.enableServerCalls) {
				CMDBuild.proxy.core.configurations.builder.Instance.read({
					loadMask: false,
					scope: configuration.scope,
					callback: configuration.callback,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

						CMDBuild.configuration.instance = Ext.create('CMDBuild.model.core.configuration.builder.Instance', decodedResponse);
					}
				});
			} else {
				Ext.callback(configuration.callback, configuration.scope);
			}
		}
	});

})();
