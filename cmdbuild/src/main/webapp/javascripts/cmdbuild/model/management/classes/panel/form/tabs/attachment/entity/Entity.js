(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Entity', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DISABLED_FEATURES, type: 'auto', defaultValue: {} }, // CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.DisabledFeatures
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.IS_SUPER_CLASS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.META, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARENT, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.PERMISSIONS, type: 'auto', defaultValue: {} }, // CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Permissions
			{ name: CMDBuild.core.constants.Proxy.TABLE_TYPE, type: 'string' },
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
			data = Ext.isObject(data) ? Ext.clone(data) : {};
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = Ext.isString(data[CMDBuild.core.constants.Proxy.TEXT]) ? data[CMDBuild.core.constants.Proxy.TEXT] : data[CMDBuild.core.constants.Proxy.DESCRIPTION];
			data[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS] = Ext.isBoolean(data['superclass']) ? data['superclass'] : data[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS];

			// DisabledFeatures adapter
			var disabledFeaturesDecoded = Ext.decode(data['ui_card_edit_mode']);

			var disabledFeaturesObject = {};
			disabledFeaturesObject[CMDBuild.core.constants.Proxy.ADD_DISABLED] = disabledFeaturesDecoded[CMDBuild.core.constants.Proxy.CREATE];
			disabledFeaturesObject[CMDBuild.core.constants.Proxy.CLONE_DISABLED] = disabledFeaturesDecoded[CMDBuild.core.constants.Proxy.CLONE];
			disabledFeaturesObject[CMDBuild.core.constants.Proxy.DELETE_DISABLED] = disabledFeaturesDecoded[CMDBuild.core.constants.Proxy.REMOVE];
			disabledFeaturesObject[CMDBuild.core.constants.Proxy.MODIFY_DISABLED] = disabledFeaturesDecoded[CMDBuild.core.constants.Proxy.MODIFY];

			data[CMDBuild.core.constants.Proxy.DISABLED_FEATURES] = Ext.create('CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.DisabledFeatures', disabledFeaturesObject);

			// Permissions adapter
			var permissionsObject = {};
			permissionsObject[CMDBuild.core.constants.Proxy.CREATE] = data['priv_create'];
			permissionsObject[CMDBuild.core.constants.Proxy.WRITE] = data['priv_write'];

			data[CMDBuild.core.constants.Proxy.PERMISSIONS] = Ext.create('CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Permissions', permissionsObject);

			this.callParent(arguments);
		},

		/**
		 * Override to permits multilevel get with a single function
		 *
		 * @param {Array or String} property
		 *
		 * @returns {Mixed or null}
		 *
		 * @override
		 */
		get: function (property) {
			if (Ext.isArray(property) && !Ext.isEmpty(property)) {
				var returnValue = this;

				Ext.Array.forEach(property, function (propertyName, i, allPropertyNames) {
					if (Ext.isObject(returnValue) && !Ext.Object.isEmpty(returnValue))
						if (Ext.isFunction(returnValue.get)) { // Ext.data.Model manage
							returnValue = returnValue.get(propertyName);
						} else if (!Ext.isEmpty(returnValue[propertyName])) { // Simple object manage
							returnValue = returnValue[propertyName];
						} else { // Not found
							returnValue = null;
						}
				}, this);

				return returnValue;
			}

			return this.callParent(arguments);
		}
	});

})();
