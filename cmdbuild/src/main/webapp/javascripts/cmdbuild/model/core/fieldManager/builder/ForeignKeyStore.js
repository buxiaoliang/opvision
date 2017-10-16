(function () {

	Ext.define('CMDBuild.model.core.fieldManager.builder.ForeignKeyStore', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'Description', type: 'string' },
			{ name: 'Id', type: 'int', useNull: true }
		]
	});

})();
