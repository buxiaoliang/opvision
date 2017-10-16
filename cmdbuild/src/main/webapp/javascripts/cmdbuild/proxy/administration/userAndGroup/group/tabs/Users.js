(function () {

	Ext.define('CMDBuild.proxy.administration.userAndGroup.group.tabs.Users', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.administration.userAndGroup.group.UsersGrid'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.controller.administration.userAndGroup.group.tabs.Users} parameters.delegate
		 *
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreAvailable: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.UNCACHED, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.group.UsersGrid',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.group.user.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS,
						totalProperty: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.TOTAL
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				],

				customLoadMethod: function () {
					parameters.delegate.cmfg('userAndGroupGroupTabUsersGridAvailableStoreLoad');
				}
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreSelected: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.GROUP, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.group.UsersGrid',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.group.user.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.ELEMENTS,
						totalProperty: CMDBuild.core.constants.Proxy.RESPONSE + '.' + CMDBuild.core.constants.Proxy.TOTAL
					},
					extraParams: { // Avoid to send limit, page and start parameters in server calls
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.NAME, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.group.user.save });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.GROUP, parameters, true);
		}
	});

})();

