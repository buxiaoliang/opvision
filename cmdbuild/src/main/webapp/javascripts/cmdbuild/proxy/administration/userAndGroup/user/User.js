(function () {

	Ext.define('CMDBuild.proxy.administration.userAndGroup.user.User', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.userAndGroup.user.DefaultGroup',
			'CMDBuild.model.administration.userAndGroup.user.User',
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.user.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.USER, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		disable: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.user.disable });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.USER, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.UNCACHED, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.user.User',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.user.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS,
						totalProperty: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.TOTAL
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreDefaultGroup: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.GROUP, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.user.DefaultGroup',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.user.readAllGroups,
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

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.user.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.USER, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readPosition: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.user.getPosition });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.user.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.USER, parameters, true);
		}
	});

})();
