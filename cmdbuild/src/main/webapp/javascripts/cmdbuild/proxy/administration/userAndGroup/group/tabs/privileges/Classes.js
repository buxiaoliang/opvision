(function () {

	Ext.define('CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.GROUP_PRIVILEGE, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.privilege.classes.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.PRIVILEGES
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
		readUIConfiguration: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.privilege.classes.uiConfiguration.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.GROUP_PRIVILEGE, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		setRowAndColumn: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.privilege.classes.setRowAndColumnPrivileges });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.GROUP_PRIVILEGE, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.privilege.classes.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.GROUP_PRIVILEGE, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		updateUIConfiguration: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.privilege.classes.uiConfiguration.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.GROUP_PRIVILEGE, parameters, true);
		}
	});

})();
