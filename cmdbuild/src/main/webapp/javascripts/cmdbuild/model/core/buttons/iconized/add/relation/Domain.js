(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.core.buttons.iconized.add.relation.Domain', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ATTRIBUTES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.PRIVILEGES, type: 'auto', defaultValue: {} }, // CMDBuild.model.core.buttons.iconized.add.relation.Privileges
			{ name: CMDBuild.core.constants.Proxy.CARDINALITY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL, type: 'boolean', defaultValue: false },
			{ name: CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES, type: 'auto', defaultValue: [] }
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
			data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID] = data['class2id'];
			data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME] = data['class2'];
			data[CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES] = data['disabled2'];
			data[CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION] = data['descrdir'];
			data[CMDBuild.core.constants.Proxy.ID] = data['idDomain'];
			data[CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION] = data['descrinv'];
			data[CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL] = data['md'];
			data[CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL] = data['md_label'];
			data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID] = data['class1id'];
			data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME] = data['class1'];
			data[CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES] = data['disabled1'];

			// Privileges adapter
			var privilegesObject = {};
			privilegesObject[CMDBuild.core.constants.Proxy.CREATE] = data['priv_create'];
			privilegesObject[CMDBuild.core.constants.Proxy.WRITE] = data['priv_write'];

			data[CMDBuild.core.constants.Proxy.PRIVILEGES] = Ext.create('CMDBuild.model.core.buttons.iconized.add.relation.Privileges', privilegesObject);

			this.callParent(arguments);
		},

		/**
		 * Override to permits multilevel get with a single function
		 *
		 * @param {Array or String} property
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (property) {
			if (Ext.isArray(property) && !Ext.isEmpty(property)) {
				var returnValue = this;

				Ext.Array.each(property, function (propertyName, i, allPropertyNames) {
					if (!Ext.isEmpty(returnValue) && Ext.isFunction(returnValue.get))
						returnValue = returnValue.get(propertyName);
				}, this);

				return returnValue;
			}

			return this.callParent(arguments);
		}
	});

})();
