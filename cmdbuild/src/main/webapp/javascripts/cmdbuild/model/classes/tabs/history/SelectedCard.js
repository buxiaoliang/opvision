(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.classes.tabs.history.SelectedCard', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CODE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			var values = Ext.clone(data);

			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.CODE] = data['Code'];
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = data['Description'];
			data[CMDBuild.core.constants.Proxy.ID] = data['Id'];
			data[CMDBuild.core.constants.Proxy.VALUES] = values;

			this.callParent(arguments);
		}
	});

})();
