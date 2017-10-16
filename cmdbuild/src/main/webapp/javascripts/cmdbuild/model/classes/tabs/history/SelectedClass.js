(function () {

	Ext.require([
		'CMDBuild.core.constants.Global',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.classes.tabs.history.SelectedClass', { // TODO: waiting for refactor (rename and structure)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TABLE_TYPE, type: 'string', defaultValue: CMDBuild.core.constants.Global.getTableTypeStandardTable() }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = data['text'];

			this.callParent(arguments);
		}
	});

})();
