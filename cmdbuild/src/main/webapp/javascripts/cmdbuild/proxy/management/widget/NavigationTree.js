(function () {

	Ext.define('CMDBuild.proxy.management.widget.NavigationTree', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.management.widget.navigationTree.Node',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		getStore: function () {
			return Ext.create('Ext.data.TreeStore', {
				model: 'CMDBuild.model.management.widget.navigationTree.Node',
				root: {
					expanded: true,
					children: []
				}
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllCards: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllClasses: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllDomains: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters);
		}
	});

})();
