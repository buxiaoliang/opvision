(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.GeoAttributes', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.classes.tabs.geoAttributes.Grid',
			'CMDBuild.model.classes.tabs.geoAttributes.Icon',
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.geoAttribute.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.GIS, {
				autoLoad: false,
				model: 'CMDBuild.model.classes.tabs.geoAttributes.Grid',
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
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreExternalGraphic: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.GIS, {
				autoLoad: true,
				model: 'CMDBuild.model.classes.tabs.geoAttributes.Icon',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.gis.icons.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS
					},
					extraParams: {
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
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreStrokeDashstyle: function () {
			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.DESCRIPTION, CMDBuild.core.constants.Proxy.VALUE],
				data: [
					[CMDBuild.Translation.dot, 'dot'],
					[CMDBuild.Translation.dash, 'dash'],
					[CMDBuild.Translation.dashdot, 'dashdot'],
					[CMDBuild.Translation.longdash, 'longdash'],
					[CMDBuild.Translation.longdashdot, 'longdashdot'],
					[CMDBuild.Translation.solid, 'solid']
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
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
					[CMDBuild.Translation.line, 'LINESTRING'],
					[CMDBuild.Translation.point, 'POINT'],
					[CMDBuild.Translation.polygon, 'POLYGON']
				],
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
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.layer.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.geoAttribute.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.gis.geoAttribute.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GIS, parameters, true);
		}
	});

})();
