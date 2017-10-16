(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.EntryType
	 */
	Ext.define('CMDBuild.model.common.panel.gridAndForm.filter.advanced.filterEditor.relations.EntryType', { // TODO: waiting for refactor (rename and structure)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CAPABILITIES, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.IS_SUPER_CLASS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.META, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARENT, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.PERMISSIONS, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.TABLE_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
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
			data[CMDBuild.core.constants.Proxy.CAPABILITIES] = data['ui_card_edit_mode'];
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = data['text'];
			data[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS] = data['superclass'];
			data[CMDBuild.core.constants.Proxy.PERMISSIONS] = {
				create: data['priv_create'],
				write: data['priv_write']
			};

			this.callParent(arguments);
		}
	});

})();
