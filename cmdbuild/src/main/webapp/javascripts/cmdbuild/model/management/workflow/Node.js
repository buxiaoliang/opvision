(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.workflow.Node', {
		extend: 'Ext.data.Model',

		fields: [
			// Workflow attributes
			{ name: CMDBuild.core.constants.Proxy.CARD_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} },

			// Activity attributes
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_ID, type: 'string' }, // Must as string because activities have string id
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_METADATA, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_PERFORMER_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ACTIVITY_WRITABLE, type: 'boolean' },

			// Common
			{ name: 'iconCls', type: 'string', defaultValue: 'cmdb-tree-no-icon', persist: false }, // ExtJs property to hide icon
			{ name: 'rawData', type: 'auto', defaultValue: [] } // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
		],

		/**
		 * Forward requests to value property
		 *
		 * @param {String} name
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (name) {
			if (name != CMDBuild.core.constants.Proxy.VALUES) {
				var values = this.get(CMDBuild.core.constants.Proxy.VALUES);

				if (Ext.Array.contains(Ext.Object.getKeys(values), name))
					return values[name];
			}

			return this.callParent(arguments);
		}
	});

})();
