(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.panel.module.attachment.entity.Permissions', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CREATE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.WRITE, type: 'boolean' }
		]
	});

})();
