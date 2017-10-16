(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.workflow.panel.form.tabs.activity.SaveResponse', { // TODO: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.FLOW_STATUS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.METADATA, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID, type: 'string' }
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
			data[CMDBuild.core.constants.Proxy.CLASS_ID] = data['IdClass'];
			data[CMDBuild.core.constants.Proxy.ID] = data['Id'];
			data[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = data['ProcessInstanceId'];

			this.callParent(arguments);
		}
	});

})();
