(function () {

	Ext.define('CMDBuild.proxy.administration.userAndGroup.group.Group', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.userAndGroup.group.StartingClass',
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		enableDisable: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.enableDisableGroup });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreStartingClass: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ENTRY_TYPE, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.group.StartingClass',
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
					function (record) { // Filters root class
						return record.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Global.getRootNameClasses();
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
				fields: [CMDBuild.core.constants.Proxy.VALUE, CMDBuild.core.constants.Proxy.DESCRIPTION],
				data: [
					[CMDBuild.core.constants.Proxy.NORMAL, CMDBuild.Translation.normal],
					[CMDBuild.core.constants.Proxy.RESTRICTED_ADMIN, CMDBuild.Translation.limitedAdministrator],
					[CMDBuild.core.constants.Proxy.ADMIN, CMDBuild.Translation.administrator]
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAll: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters, true);
		}
	});

})();
