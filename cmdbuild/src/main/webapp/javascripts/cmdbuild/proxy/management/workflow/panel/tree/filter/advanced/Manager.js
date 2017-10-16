(function () {

	Ext.define('CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter',
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreUser: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.FILTER, {
				autoLoad: false,
				model: 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.filter.user.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.FILTERS,
						idProperty: CMDBuild.core.constants.Proxy.ID
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' },
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters, true);
		}
	});

})();
