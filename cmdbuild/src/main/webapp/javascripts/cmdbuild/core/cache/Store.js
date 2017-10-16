(function () {

	/**
	 * To use only inside cache class
	 *
	 * @private
	 */
	Ext.define('CMDBuild.core.cache.Store', {
		extend: 'Ext.data.Store',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.interfaces.Ajax'
		],

		/**
		 * @cfg {String}
		 */
		groupId: undefined,

		/**
		 * @cfg {String}
		 */
		type: 'store',

		/**
		 * @param {Array} records
		 * @param {Object} operation
		 * @param {Boolean} success
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		callbackInterceptor: function (records, operation, success) {
			var decodedResponse = {};

			if (!Ext.isEmpty(operation) && !Ext.isEmpty(operation.response) && !Ext.isEmpty(operation.response.responseText))
				decodedResponse = CMDBuild.core.interfaces.Ajax.decodeJson(operation.response.responseText);

			if (!CMDBuild.global.interfaces.Configurations.get('disableAllMessages')) {
				if (!CMDBuild.global.interfaces.Configurations.get('disableWarnings'))
					CMDBuild.core.interfaces.messages.Warning.display(decodedResponse);

				if (!CMDBuild.global.interfaces.Configurations.get('disableErrors'))
					CMDBuild.core.interfaces.messages.Error.display(decodedResponse, operation.request);
			}

			return true;
		},

		/**
		 * @param {Function or Object} options
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		load: function (options) {
			options = Ext.isEmpty(options) ? {} : options;

			Ext.applyIf(options, {
				callback: Ext.emptyFn,
				params: {},
				scope: this
			});

			if (
				CMDBuild.global.Cache.isEnabled()
				&& CMDBuild.global.Cache.isCacheable(this.groupId)
			) {
				var parameters = {
					type: this.type,
					groupId: this.groupId,
					serviceEndpoint: this.proxy.url,
					params: Ext.clone(Ext.Object.merge(this.getProxy().extraParams, options.params)) // Merge params and extraParams
				};

				// Avoid different stores to join results adding store model to parameters
				parameters.params.modelName = this.model.getName();

				if (!CMDBuild.global.Cache.isExpired(parameters)) { // Emulation of callback execution
					var cachedValues = CMDBuild.global.Cache.get(parameters);

					this.loadData(cachedValues.records);

					// Interceptor to manage error/warning messages
					options.callback = Ext.Function.createInterceptor(options.callback, this.callbackInterceptor, this);

					// onProxyLoad() callback emulation
					if (this.hasListeners.load)
						this.fireEvent('load', this, cachedValues.records, cachedValues.success);

					return Ext.callback(options.callback, options.scope, [cachedValues.records, cachedValues.operation, cachedValues.success]);
				} else { // Execute real Ajax call
					options.callback = Ext.Function.createSequence(function (records, operation, success) {
						Ext.apply(parameters, {
							values: {
								records: records,
								operation: operation,
								success: success
							}
						});

						// Cache builder call
						CMDBuild.global.Cache.set(parameters);
					}, options.callback);
				}
			}

			// Interceptor to manage error/warning messages
			options.callback = Ext.Function.createInterceptor(options.callback, this.callbackInterceptor, this);

			// Uncachable endpoint manage
			this.callParent(arguments);
		}
	});

})();
