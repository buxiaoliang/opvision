(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.Grid', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EXECUTABLE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'auto', convert: converterType }
		]
	});

	/**
	 * @param {String} value
	 * @param {Object} record
	 *
	 * @returns {Array}
	 *
	 * @private
	 */
	function converterType(value, record) {
		return value.indexOf('_') > 0 ? value.split('_') : [value]; // Manage type property with separator characters (underscore)
	}

})();
