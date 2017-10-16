(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.management.routes.Instance', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER, type: 'int', useNull: true }, // Process instance ID
			{ name: CMDBuild.core.constants.Proxy.PROCESS_IDENTIFIER, type: 'string' }, // Process name
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
			if (data[CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER].indexOf(CMDBuild.core.configurations.Routes.getSimpleFilterSeparator()) >= 0) {
				var simpleFilterObject = {};
				var simpleFilterSplittedSections = data[CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER].split(CMDBuild.core.configurations.Routes.getSimpleFilterSeparator());

				if (
					Ext.isArray(simpleFilterSplittedSections) && !Ext.isEmpty(simpleFilterSplittedSections) && simpleFilterSplittedSections.length == 2
					&& Ext.isString(simpleFilterSplittedSections[0]) && !Ext.isEmpty(simpleFilterSplittedSections[0])
					&& Ext.isString(simpleFilterSplittedSections[1]) && !Ext.isEmpty(simpleFilterSplittedSections[1])
				) {
					simpleFilterObject[CMDBuild.core.constants.Proxy.KEY] = simpleFilterSplittedSections[0];
					simpleFilterObject[CMDBuild.core.constants.Proxy.VALUE] = simpleFilterSplittedSections[1];
				}

				data[CMDBuild.core.constants.Proxy.INSTANCE_IDENTIFIER] = null;
				data[CMDBuild.core.constants.Proxy.SIMPLE_FILTER] = simpleFilterObject;
			}

			this.callParent(arguments);
		}
	});

})();
