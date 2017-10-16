(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.navigationTree.Class', { // FIXME: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARENT, type: 'int', useNull: true }
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
