(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.CMActivityInstance
	 */
	Ext.define('CMDBuild.model.management.workflow.Activity', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'rawData', type: 'auto', defaultValue: {} }, // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.INSTRUCTIONS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.METADATA, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.PERFORMER_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VARIABLES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.WIDGETS, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.WRITABLE, type: 'boolean' }
		]
	});

})();
