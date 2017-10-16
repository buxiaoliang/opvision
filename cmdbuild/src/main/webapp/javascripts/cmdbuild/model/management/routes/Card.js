(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.routes.Card', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CARD_IDENTIFIER, type: 'int', useNull: true }, // Card ID
			{ name: CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER, type: 'string' }, // Class name
			{ name: CMDBuild.core.constants.Proxy.FORMAT, type: 'string', defaultValue: CMDBuild.core.constants.Proxy.PDF }, // Print format
			{ name: CMDBuild.core.constants.Proxy.SIMPLE_FILTER, type: 'auto', defaultValue: {} }
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

			// Manage simple filter
			if (data[CMDBuild.core.constants.Proxy.CARD_IDENTIFIER].indexOf(CMDBuild.core.configurations.Routes.getSimpleFilterSeparator()) >= 0) {
				var simpleFilterObject = {};
				var simpleFilterSplittedSections = data[CMDBuild.core.constants.Proxy.CARD_IDENTIFIER].split(CMDBuild.core.configurations.Routes.getSimpleFilterSeparator());

				if (
					Ext.isArray(simpleFilterSplittedSections) && !Ext.isEmpty(simpleFilterSplittedSections) && simpleFilterSplittedSections.length == 2
					&& Ext.isString(simpleFilterSplittedSections[0]) && !Ext.isEmpty(simpleFilterSplittedSections[0])
					&& Ext.isString(simpleFilterSplittedSections[1]) && !Ext.isEmpty(simpleFilterSplittedSections[1])
				) {
					simpleFilterObject[CMDBuild.core.constants.Proxy.KEY] = simpleFilterSplittedSections[0];
					simpleFilterObject[CMDBuild.core.constants.Proxy.VALUE] = simpleFilterSplittedSections[1];
				}

				data[CMDBuild.core.constants.Proxy.CARD_IDENTIFIER] = null;
				data[CMDBuild.core.constants.Proxy.SIMPLE_FILTER] = simpleFilterObject;
			}

			this.callParent(arguments);
		}
	});

})();
