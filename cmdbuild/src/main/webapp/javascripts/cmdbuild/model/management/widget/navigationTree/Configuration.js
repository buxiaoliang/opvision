(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.widget.navigationTree.Configuration', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ALWAYS_ENABLED, type: 'boolean' },
			// { name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' }, // FIXME: future implementation
			// { name: CMDBuild.core.constants.Proxy.FILTER, type: 'auto', defaultValue: {} }, // FIXME: future implementation
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PRESET, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.TREE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', defaultValue: '.NavigationTree' }
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
			data[CMDBuild.core.constants.Proxy.ALWAYS_ENABLED] = data['alwaysenabled'];
			data[CMDBuild.core.constants.Proxy.TREE_NAME] = data['navigationTreeName'];

			this.callParent(arguments);
		}
	});

})();
