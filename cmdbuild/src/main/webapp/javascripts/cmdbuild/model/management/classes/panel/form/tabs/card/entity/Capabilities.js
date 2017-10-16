(function () {

	Ext.require(['CMDBuild.core.constants.Proxy']);

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.card.entity.Capabilities', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ADD_DISABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CLONE_DISABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DELETE_DISABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.MODIFY_DISABLED, type: 'boolean' }
		]
	});

})();
