(function () {

	Ext.define('CMDBuild.proxy.administration.filter.group.Group', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.filter.group.Store',
			'CMDBuild.model.administration.filter.group.TargetClass',
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
		 * Returns a store with the filters for a given group
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.FILTER, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.filter.group.Store',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.filter.group.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.FILTERS,
						totalProperty: CMDBuild.core.constants.Proxy.COUNT
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreTargetClass: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ENTRY_TYPE, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.filter.group.TargetClass',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.entryType.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.CLASSES
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters root of all classes
						return record.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Global.getRootNameClasses();
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAll: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.filter.group.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.FILTER, parameters);
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
		}
	});

})();
