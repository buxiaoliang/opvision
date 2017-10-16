(function () {

	Ext.define('CMDBuild.proxy.management.widget.openReport.ParametersWindow', {

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
		download: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				url: CMDBuild.proxy.index.Json.report.factory.print + '?donotdelete=true'  // Add parameter to avoid report delete
			});

			CMDBuild.core.interfaces.FormSubmit.submit(parameters);
		}
	});

})();
