(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.Layers', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.classes.tabs.layers.Grid'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.GIS, {
				autoLoad: false,
				model: 'CMDBuild.model.classes.tabs.layers.Grid',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.gis.layer.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.LAYERS
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.INDEX, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		setVisibility: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.layer.setVisibility });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters, true);
		}
	});

})();
