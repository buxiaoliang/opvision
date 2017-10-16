(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.card.PreviousItem', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ENTITY_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ENTITY_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', type: 'int', useNull: true }
		]
	});

})();
