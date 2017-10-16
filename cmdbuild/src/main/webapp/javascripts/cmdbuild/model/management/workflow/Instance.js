(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.CMActivityInstance
	 */
	Ext.define('CMDBuild.model.management.workflow.Instance', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'rawData', type: 'auto', defaultValue: [] }, // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			{ name: CMDBuild.core.constants.Proxy.BEGIN_DATE_AS_LONG, type: 'int', useNull: true }, // Used server side to be sure to update last process version
			{ name: CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FLOW_STATUS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} }
		]
	});

})();
