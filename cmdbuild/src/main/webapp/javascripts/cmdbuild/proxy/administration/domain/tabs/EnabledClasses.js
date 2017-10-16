(function () {

	Ext.define('CMDBuild.proxy.administration.domain.tabs.EnabledClasses', {

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
		readEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entryType.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTRY_TYPE, parameters);
		}
	});

})();
