(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.openReport.Configuration', { // TODO: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ALWAYS_ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.FORCE_FORMAT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PRESET, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.REPORT_CODE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', defaultValue: '.OpenReport' }
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
			data[CMDBuild.core.constants.Proxy.ALWAYS_ENABLED] = data['alwaysenabled'];

			this.callParent(arguments);
		}
	});

})();
