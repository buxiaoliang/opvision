(function () {

	Ext.require([
		'CMDBuild.core.configurations.DataFormat',
		'CMDBuild.core.constants.Proxy'
	]);

	Ext.define('CMDBuild.model.management.classes.panel.form.tabs.attachment.SelectedCard', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.BEGIN_DATE, type: 'date', dateFormat: CMDBuild.core.configurations.DataFormat.getDateTime() },
			{ name: CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CODE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.USER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: {} } // NOTE: equals to raw data
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
			data[CMDBuild.core.constants.Proxy.VALUES] = Ext.clone(data);
			data[CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION] = data['IdClass_value'];
			data[CMDBuild.core.constants.Proxy.CLASS_ID] = data['IdClass'];
			data[CMDBuild.core.constants.Proxy.CODE] = data['Code'];
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = data['Description'];
			data[CMDBuild.core.constants.Proxy.ID] = data['Id'];

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
