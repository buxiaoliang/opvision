(function () {

	Ext.define('CMDBuild.proxy.common.field.display.Reference', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.common.field.display.Reference',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
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
