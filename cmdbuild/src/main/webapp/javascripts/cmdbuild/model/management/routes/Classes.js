(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.routes.Classes', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER, type: 'string' }, // Class name
			{ name: CMDBuild.core.constants.Proxy.CLIENT_FILTER, type: 'auto', defaultValue: {} }, // a.k.a. Advanced filter
			{ name: CMDBuild.core.constants.Proxy.FORMAT, type: 'string', defaultValue: CMDBuild.core.constants.Proxy.PDF } // Print format
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
			data[CMDBuild.core.constants.Proxy.CLIENT_FILTER] = Ext.isString(data[CMDBuild.core.constants.Proxy.CLIENT_FILTER]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.CLIENT_FILTER])
				? Ext.decode(data[CMDBuild.core.constants.Proxy.CLIENT_FILTER]) : null;

			this.callParent(arguments);
		}
	});

})();
