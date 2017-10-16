(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.card.entity.Entity', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CAPABILITIES, type: 'auto', defaultValue: {} }, // CMDBuild.model.management.dataView.filter.entryType.Capabilities
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.IS_SUPER_CLASS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARENT, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.PERMISSIONS, type: 'auto', defaultValue: {} }, // CMDBuild.model.management.dataView.filter.entryType.Permissions
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

			// Capabilities setup
			var decodedProperty = Ext.decode(data['ui_card_edit_mode']);

			data[CMDBuild.core.constants.Proxy.CAPABILITIES] = Ext.create('CMDBuild.model.management.classes.panel.form.tabs.card.entity.Capabilities', {
				addDisabled: decodedProperty['create'],
				cloneDisabled: decodedProperty['clone'],
				deleteDisabled: decodedProperty['remove'],
				modifyDisabled: decodedProperty['modify']
			});

			// Permissions setup
			data[CMDBuild.core.constants.Proxy.PERMISSIONS] = Ext.create('CMDBuild.model.management.classes.panel.form.tabs.card.entity.Permissions', {
				create: data['priv_create'],
				write: data['priv_write']
			});

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
