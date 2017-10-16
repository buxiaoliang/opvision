(function () {

	Ext.define('CMDBuild.proxy.administration.workflow.tabs.Properties', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.administration.workflow.tabs.properties.Parent'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreSuperProcesses: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.WORKFLOW, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.workflow.tabs.properties.Parent',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.workflow.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters non super-processes
						return record.get('superclass');
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});
		}
	});

})();
