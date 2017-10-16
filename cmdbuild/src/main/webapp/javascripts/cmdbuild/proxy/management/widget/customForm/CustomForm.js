(function () {

	Ext.define('CMDBuild.proxy.management.widget.customForm.CustomForm', {

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
		readAllCards: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters)
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readFromFunctions: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.functions.readCards });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		}
	});

})();
