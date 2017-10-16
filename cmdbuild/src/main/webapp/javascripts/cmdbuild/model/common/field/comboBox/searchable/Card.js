(function () {

	Ext.define('CMDBuild.model.common.field.comboBox.searchable.Card', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'Description', type: 'string' },
			{ name: 'Id', type: 'int', useNull: true }
		]
	});

})();
