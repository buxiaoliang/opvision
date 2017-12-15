(function () {

	/**
	 * @deprecated (old cache system is dismissed)
	 */
	Ext.define('CMDBuild.proxy.Cache', {

		uses: [
			'CMDBuild.cache.CMReferenceStoreModel',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.cache.LookupFieldStore'
		],

		singleton: true,

		/**
		 * @param {Object} baseParams
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreForeignKey: function (baseParams) {
			baseParams = Ext.isObject(baseParams) ? baseParams : {};
			baseParams[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);

			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad: true,
				model: 'CMDBuild.cache.CMReferenceStoreModel',
				baseParams: baseParams, // Retro-compatibility
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.REFERENCE_COMBO_STORE_LIMIT),
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					},
					extraParams: baseParams
				},
				sorters: [
					{ property: 'Description', direction: 'ASC' }
				],
				listeners: {
					beforeload: function (store, operation, eOpts) {
						var encodedExtraParams = Ext.encode(store.getProxy().extraParams);

						return Ext.Array.every(['{client', '{cql', '{group', '{js', '{server', '{user', '{xa'], function (template, i, allTemplates) {
							return encodedExtraParams.indexOf(template) < 0; // Stops loop at first template found
						}, this);
					}
				}
			});
		},

		/**
		 * @param {String} type
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreLookup: function (type) {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.LOOKUP, {
				autoLoad: true,
				model: 'CMDBuild.model.cache.LookupFieldStore',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.lookup.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS
					},
					extraParams: {
						type: type,
						active: true,
						short: true
					},
					actionMethods: 'POST' // Lookup types can have UTF-8 names  not handled correctly
				},
				sorters: [
					{ property: 'Number', direction: 'ASC' },
					{ property: 'Description', direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Boolean} isOneTime
		 * @param {Object} baseParams
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store} store
		 */
		getStoreReference: function (isOneTime, baseParams) {
			baseParams = Ext.isObject(baseParams) ? baseParams : {};
			baseParams[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);

			var store = CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad: !isOneTime,
				model: 'CMDBuild.cache.CMReferenceStoreModel',
				isOneTime: isOneTime,
				baseParams: baseParams, // Retro-compatibility,
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.REFERENCE_COMBO_STORE_LIMIT),
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					},
					extraParams: baseParams
				},
				sorters: [
					{ property: 'Description', direction: 'ASC' }
				],
				listeners: {
					beforeload: function (store, operation, eOpts) {
						var encodedExtraParams = Ext.encode(store.getProxy().extraParams);

						return Ext.Array.every(['{client', '{cql', '{group', '{js', '{server', '{user', '{xa'], function (template, i, allTemplates) {
							return encodedExtraParams.indexOf(template) < 0; // Stops loop at first template found
						}, this);
					}
				}
			});

			// Clear store filter property to avoid filter parameter stack witch drive to get url overflow error (reason is unknown)
			if (baseParams.NoFilter)
				store.filters.clear();

			return store;
		}
	});

})();
