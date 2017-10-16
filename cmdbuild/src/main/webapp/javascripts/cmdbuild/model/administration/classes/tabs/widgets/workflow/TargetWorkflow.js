(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.classes.tabs.widgets.workflow.TargetWorkflow', { // TODO: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'superclass', type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ID,  type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TEXT,  type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
		]
	});

})();
