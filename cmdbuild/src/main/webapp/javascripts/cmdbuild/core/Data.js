(function () {

	Ext.define('CMDBuild.core.Data', {

		requires: [
			'CMDBuild.core.configurations.Timeout',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.CookiesManager'
		],

		/**
		 * Enable/Disable header to get localized server responses
		 *
		 * @cfg {Boolean}
		 */
		enableLocalized: false,

		/**
		 * Setup with overrides of all data configurations (timeouts, defaultHeaders)
		 *
		 * @param {Object} configurationObject
		 *
		 * @returns {Void}
		 */
		constructor: function (configurationObject) {
			Ext.apply(this, configurationObject); // Apply configurations

			var authorizationKey = CMDBuild.core.CookiesManager.authorizationGet();

			// Error handling
				if (!Ext.isObject(CMDBuild) || Ext.isEmpty(CMDBuild))
					return _error('constructor(): undefined CMDBuild object', this);

				if (!Ext.isString(authorizationKey) || Ext.isEmpty(authorizationKey))
					return _error('constructor(): invalid chooky authorization key value', this, authorizationKey);
			// END: Error handling

			Ext.Ajax.timeout = CMDBuild.core.configurations.Timeout.getBase() * 1000;
			Ext.Ajax[CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY] = CMDBuild.core.CookiesManager.authorizationGet();
			Ext.Ajax[CMDBuild.core.constants.Proxy.LOCALIZED_HEADER_KEY] = this.enableLocalized;

			this.dataDefaultHeadersUpdate();

			Ext.define('CMDBuild.data.proxy.Ajax', {
				override: 'Ext.data.proxy.Ajax',

				timeout: CMDBuild.core.configurations.Timeout.getBase() * 1000
			});

			Ext.define('CMDBuild.form.Basic', {
				override: 'Ext.form.Basic',

				timeout: CMDBuild.core.configurations.Timeout.getBase()
			});

			// Setup global reference
			Ext.ns('CMDBuild.global');
			CMDBuild.global.Data = this;
		},

		/**
		 * @returns {Void}
		 */
		dataDefaultHeadersUpdate: function () {
			var defaultHeaders = {};
			defaultHeaders[CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY] = CMDBuild.core.CookiesManager.authorizationGet();
			defaultHeaders[CMDBuild.core.constants.Proxy.LOCALIZED_HEADER_KEY] = this.enableLocalized;

			Ext.define('CMDBuild.data.Connection', {
				override: 'Ext.data.Connection',

				timeout: CMDBuild.core.configurations.Timeout.getBase() * 1000,
				defaultHeaders: defaultHeaders
			});

			Ext.Ajax[CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY] = CMDBuild.core.CookiesManager.authorizationGet();
		}
	});

})();
