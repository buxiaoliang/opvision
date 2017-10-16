(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.administration.userAndGroup.group.userInterface.DisabledModules
	 */
	Ext.define('CMDBuild.model.core.configuration.builder.userInterface.DisabledModules', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.BULK_UPDATE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CHANGE_PASSWORD, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CLASS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CUSTOM_PAGES, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DASHBOARD, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DATA_VIEW, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.EXPORT_CSV, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.IMPORT_CSV, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.PROCESS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.REPORT, type: 'boolean' }
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

			if (Ext.isEmpty(data[CMDBuild.core.constants.Proxy.BULK_UPDATE]))
				data[CMDBuild.core.constants.Proxy.BULK_UPDATE] = data['bulkupdate'];

			if (Ext.isEmpty(data[CMDBuild.core.constants.Proxy.EXPORT_CSV]))
				data[CMDBuild.core.constants.Proxy.EXPORT_CSV] = data['exportcsv'];

			if (Ext.isEmpty(data[CMDBuild.core.constants.Proxy.IMPORT_CSV]))
				data[CMDBuild.core.constants.Proxy.IMPORT_CSV] = data['importcsv'];

			this.callParent(arguments);
		}
	});

})();
