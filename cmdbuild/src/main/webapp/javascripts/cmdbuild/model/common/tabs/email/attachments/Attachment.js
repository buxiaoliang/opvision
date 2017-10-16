(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.common.tabs.email.attachments.Attachment', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILE_NAME, type: 'string' }
		]
	});

})();
