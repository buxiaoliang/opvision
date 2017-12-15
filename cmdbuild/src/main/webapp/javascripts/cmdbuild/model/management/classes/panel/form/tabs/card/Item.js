(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.card.Item', { // TODO: waiting for refactor (rename and structure)
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.BEGIN_DATE, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.CODE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENTITY_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENTITY_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ENTITY_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.REFERENCE_ATTRIBUTES, type: 'auto', defaultValue: {} }, // {Object} - Ex: { referenceName: { firstAttr: ..., secondAttr: ...  }, ...  }
			{ name: CMDBuild.core.constants.Proxy.SOURCE_OBJECT, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PERMISSIONS, type: 'auto', defaultValue: {}},
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {}, }
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
			data[CMDBuild.core.constants.Proxy.SOURCE_OBJECT] = Ext.clone(data[CMDBuild.core.constants.Proxy.CARD]);
			data[CMDBuild.core.constants.Proxy.CARD] = Ext.isObject(data[CMDBuild.core.constants.Proxy.CARD]) ? data[CMDBuild.core.constants.Proxy.CARD] : {};
			data[CMDBuild.core.constants.Proxy.CODE] = data[CMDBuild.core.constants.Proxy.CARD]['Code'];
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = data[CMDBuild.core.constants.Proxy.CARD]['Description'];
			data[CMDBuild.core.constants.Proxy.ENTITY_DESCRIPTION] = data[CMDBuild.core.constants.Proxy.CARD]['IdClass_value'];
			data[CMDBuild.core.constants.Proxy.ENTITY_ID] = data[CMDBuild.core.constants.Proxy.CARD]['IdClass'];
			data[CMDBuild.core.constants.Proxy.ENTITY_NAME] = data[CMDBuild.core.constants.Proxy.CARD][CMDBuild.core.constants.Proxy.CLASS_NAME];
			data[CMDBuild.core.constants.Proxy.ID] = data[CMDBuild.core.constants.Proxy.CARD]['Id'];
			data[CMDBuild.core.constants.Proxy.USER] = data[CMDBuild.core.constants.Proxy.CARD][CMDBuild.core.constants.Proxy.USER];
			data[CMDBuild.core.constants.Proxy.VALUES] = data[CMDBuild.core.constants.Proxy.CARD];
			data[CMDBuild.core.constants.Proxy.PERMISSIONS] = data[CMDBuild.core.constants.Proxy.METADATA];
			
			this.callParent(arguments);
		},

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
			var value = this.callParent(arguments);

			if (Ext.isEmpty(value)) {
				var values = this.get(CMDBuild.core.constants.Proxy.VALUES);

				if (Ext.Array.contains(Ext.Object.getKeys(values), name))
					return values[name];
			}

			return value;
		}
	});

})();
