(function () {

	Ext.define('CMDBuild.proxy.management.classes.tabs.Note', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 *
		 * @management
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		}
	});

})();
