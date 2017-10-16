(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.userAndGroup.user.User', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.DEFAULT_GROUP_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EMAIL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PRIVILEGED, type: 'boolean', defaultValue: false },
			{ name: CMDBuild.core.constants.Proxy.SERVICE, type: 'boolean', defaultValue: false }
		]
	});

})();
