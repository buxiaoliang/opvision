(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.panel.module.attachment.category.MetadataGroup', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.META, type: 'auto', defaultValue: [] }, // Group fields definition object
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' }
		]
	});

})();
