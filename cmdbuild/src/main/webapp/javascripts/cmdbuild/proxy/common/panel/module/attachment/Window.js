(function () {

	Ext.define('CMDBuild.proxy.common.panel.module.attachment.Window', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readEntity: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTRY_TYPE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readItem: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.item.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ITEM, parameters);
		}
	});

})();
