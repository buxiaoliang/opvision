(function () {

	Ext.define('CMDBuild.proxy.common.panel.module.attachment.Modify', {

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.interfaces.FormSubmit',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attachment.update });

			CMDBuild.core.interfaces.FormSubmit.submit(parameters);
		}
	});

})();
