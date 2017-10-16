(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.field.trigger.cron.window.EditConfiguration', {
		extend: 'Ext.data.TreeModel',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.TITLE, type: 'string' }
		]
	});

})();
