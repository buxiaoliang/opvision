(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.navigationTree.Domain', { // TODO: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME, type: 'string' }
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
			data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME] = data['class2'];
			data[CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION] = data['descrdir'];
			data[CMDBuild.core.constants.Proxy.ID] = data['idDomain'];
			data[CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION] = data['descrinv'];
			data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME] = data['class1'];

			this.callParent(arguments);
		}
	});

})();
