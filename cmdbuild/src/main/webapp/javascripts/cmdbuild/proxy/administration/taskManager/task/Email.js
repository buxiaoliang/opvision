(function () {

	Ext.define('CMDBuild.proxy.administration.taskManager.task.Email', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.Grid',
			'CMDBuild.model.administration.taskManager.task.email.Account',
			'CMDBuild.model.administration.taskManager.task.email.Lookup',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		create: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.taskManager.email.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.TASK_MANAGER, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.TASK_MANAGER, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.taskManager.Grid',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.taskManager.email.readAll,
					reader: {
						type: 'json',
						root: 'response.elements'
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TYPE, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreAccount: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.taskManager.task.email.Account',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.email.account.readAll,
					reader: {
						type: 'json',
						root: 'response.elements'
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
		getStoreLokup: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.LOOKUP, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.taskManager.task.email.Lookup',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.lookup.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS
					},
					actionMethods: 'POST' // Lookup types can have UTF-8 names not handled correctly
				},
				sorters: [
					{ property: 'Number', direction: 'ASC' },
					{ property: 'Description', direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.taskManager.email.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.TASK_MANAGER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.taskManager.email.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.TASK_MANAGER, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.taskManager.email.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.TASK_MANAGER, parameters, true);
		}
	});

})();
