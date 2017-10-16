(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.navigationTree.Node', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CARD_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NAVIGATION_TREE_NODE_ID, type: 'int', useNull: true }
		]
	});

})();
