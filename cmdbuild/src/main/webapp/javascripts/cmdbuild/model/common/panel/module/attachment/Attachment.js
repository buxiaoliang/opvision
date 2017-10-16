(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.common.panel.module.attachment.Attachment', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.AUTHOR, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CATEGORY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CREATION, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.META, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.MODIFICATION, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.VERSION, type: 'string', sortType: 'asNatural' },
			{ name: CMDBuild.core.constants.Proxy.VERSIONABLE, type: 'boolean' }
		]
	});

})();
