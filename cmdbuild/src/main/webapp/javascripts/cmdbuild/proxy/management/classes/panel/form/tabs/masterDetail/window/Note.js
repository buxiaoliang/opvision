(function () {

	Ext.define('CMDBuild.proxy.management.classes.panel.form.tabs.masterDetail.window.Note', {

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
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		}
	});

})();
