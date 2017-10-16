(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.Properties', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.classes.tabs.properties.Parent',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreSuperClasses: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CLASS, {
				autoLoad: true,
				model: 'CMDBuild.model.classes.tabs.properties.Parent',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.classes.readAll,
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
					function (record) { // Filters all non superclass classes
						return record.get('superclass');
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreType: function () {
			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.DESCRIPTION, CMDBuild.core.constants.Proxy.VALUE],
				data: [
					[CMDBuild.Translation.standard, CMDBuild.core.constants.Global.getTableTypeStandardTable()],
					[CMDBuild.Translation.simple, CMDBuild.core.constants.Global.getTableTypeSimpleTable()]
				]
			});
		}
	});

})();
