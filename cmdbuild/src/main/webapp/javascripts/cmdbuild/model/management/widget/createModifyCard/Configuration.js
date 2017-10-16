(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.constants.WidgetType'
	]);

	Ext.define('CMDBuild.model.management.widget.createModifyCard.Configuration', { // FIXME: waiting for refactor (rename)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ALWAYS_ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.CQL_FILTER, type: 'string' }, // card CQL selector
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MODEL, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.PRESETS, type: 'auto', defaultValue: {} }, // { activityAttributeName: cardAttributeName, ... }
			{ name: CMDBuild.core.constants.Proxy.READ_ONLY, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.TARGET_CLASS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', defaultValue: CMDBuild.core.constants.WidgetType.getCreateModifyCard() }
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
			data[CMDBuild.core.constants.Proxy.CQL_FILTER] = data['idcardcqlselector'];
			data[CMDBuild.core.constants.Proxy.MODEL] = Ext.decode(data[CMDBuild.core.constants.Proxy.MODEL]);
			data[CMDBuild.core.constants.Proxy.PRESETS] = data['attributeMappingForCreation'];
			data[CMDBuild.core.constants.Proxy.READ_ONLY] = data['readonly'];

			this.callParent(arguments);
		}
	});

})();
