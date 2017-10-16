(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.navigationTree.NavigationTreeNodeStructure', { // FIXME: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CHILD_NODES_ID, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.DOMAIN_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.PARENT_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.TARGET_CLASS_NAME, type: 'string' }
		],

		/**
		 * @param {Object} data
		 *
		 * @override
		 */
		constructor: function (data) {
			data = data || {};
			data[CMDBuild.core.constants.Proxy.CHILD_NODES_ID] = [];
			data[CMDBuild.core.constants.Proxy.PARENT_ID] = data['idParent'];

			// Build childNodesId array
			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.CHILD_NODES]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.CHILD_NODES]))
				Ext.Array.each(data[CMDBuild.core.constants.Proxy.CHILD_NODES], function (childNodeObject, i, allChildNodeObjects) {
					if (Ext.isObject(childNodeObject) && !Ext.Object.isEmpty(childNodeObject))
						data[CMDBuild.core.constants.Proxy.CHILD_NODES_ID].push(childNodeObject[CMDBuild.core.constants.Proxy.ID]);
				}, this)

			this.callParent(arguments);
		}
	});

})();
