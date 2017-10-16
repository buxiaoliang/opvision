(function () {

	Ext.define('CMDBuild.proxy.core.fieldManager.builders.ForeignKey', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.core.fieldManager.builder.ForeignKeyStore'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.extraParams
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function (parameters) {
			parameters.extraParams[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);

			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad: true,
				model: 'CMDBuild.model.core.fieldManager.builder.ForeignKeyStore',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.REFERENCE_COMBO_STORE_LIMIT),
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.card.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					},
					extraParams: parameters.extraParams
				},
				sorters: [
					{ property: 'Description', direction: 'ASC' }
				]
			});
		},

		/**
		 * @property {Object} parameters
		 *
		 * @returns {Void}
		 */
		readCard: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		}
	});

})();
