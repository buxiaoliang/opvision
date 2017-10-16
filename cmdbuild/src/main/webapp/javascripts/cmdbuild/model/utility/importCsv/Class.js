(function() {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.utility.importCsv.Class', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION,  type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID,  type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PERMISSIONS, type: 'auto', defaultValue: {},  convert: converterPermissions }// CMDBuild.model.utility.importCsv.Permissions
		],

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

	/**
	 * @param {Object} value
	 * @param {CMDBuild.model.utility.importCsv.Class} record
	 *
	 * @returns {CMDBuild.model.utility.importCsv.Permissions}
	 *
	 * @private
	 */
	function converterPermissions(value, record) {
		return Ext.create('CMDBuild.model.utility.importCsv.Permissions', value);
	}

})();