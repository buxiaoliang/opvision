(function () {

	Ext.define('CMDBuild.proxy.administration.configuration.notifications.tabs.Email', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.configuration.notifications.Account',
			'CMDBuild.model.administration.configuration.notifications.Template',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreAccount: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.configuration.notifications.Account',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.email.account.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS
					},
					extraParams: { // Avoid to send limit, page and start parameters in server calls
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreTemplate: function (autoLoad) {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.configuration.notifications.Template',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.email.template.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS
					},
					extraParams: { // Avoid to send limit, page and start parameters in server calls
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readTemplate: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.email.template.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE, parameters);
		}
	});

})();
