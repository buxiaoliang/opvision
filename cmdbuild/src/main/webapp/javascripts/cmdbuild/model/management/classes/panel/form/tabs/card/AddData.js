(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.card.AddData', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ENTITY_ID, type: 'int', useNull: true }
		]
	});

})();
