(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.Workflow', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DISABLE_SYNCHRONIZATION_OF_MISSING_VARIABLES, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.PASSWORD, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.URL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' }
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
			data[CMDBuild.core.constants.Proxy.URL] = data['endpoint'];

			this.callParent(arguments);
		}
	});

})();
