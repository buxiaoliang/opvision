(function () {

	Ext.define('CMDBuild.proxy.common.panel.module.attachment.Add', {

		requires: [
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
		create: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attachment.create });

			CMDBuild.core.interfaces.FormSubmit.submit(parameters);
		}
	});

})();
