(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * CMDBuild configuration object
	 *
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.Dms', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY] = data['category.lookup'];
			data[CMDBuild.core.constants.Proxy.TYPE] = data['dms.service.type'];

			this.callParent(arguments);
		}
	});

})();
