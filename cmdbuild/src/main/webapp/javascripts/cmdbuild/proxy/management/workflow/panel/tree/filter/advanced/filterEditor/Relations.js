(function () {

	Ext.define('CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.filterEditor.Relations', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DestinationEditorStore',
			'CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		getDomains: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.getDomains });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreDestination: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ENTRY_TYPE, {
				autoLoad: true,
				model: 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DestinationEditorStore',
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
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreDomain: function () {
			return Ext.create('Ext.data.ArrayStore', {
				model: 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid',
				data: [],

				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DOMAIN_DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTRY_TYPE, parameters);
		}
	});

})();
