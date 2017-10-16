(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.common.panel.module.attachment.category.Category', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.METADATA_GROUPS, type: 'auto', defaultValue: [] }, // CMDBuild.model.common.panel.module.attachment.category.MetadataGroup
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? Ext.clone(data) : {};

			// MetadataGroups setup
			var metadataGroupArray = [];

			if (Ext.isArray(data[CMDBuild.core.constants.Proxy.META]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.META]))
				Ext.Array.forEach(data[CMDBuild.core.constants.Proxy.META], function (groupObject, i, allGroupObjects) {
					if (Ext.isObject(groupObject) && !Ext.Object.isEmpty(groupObject))
						metadataGroupArray.push(Ext.create('CMDBuild.model.common.panel.module.attachment.category.MetadataGroup', groupObject));
				}, this);

			data[CMDBuild.core.constants.Proxy.METADATA_GROUPS] = metadataGroupArray;

			this.callParent(arguments);
		}
	});

})();
