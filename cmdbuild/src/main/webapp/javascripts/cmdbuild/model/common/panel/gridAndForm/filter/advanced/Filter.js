(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter
	 */
	Ext.define('CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter', {
		extend: 'Ext.data.Model',

		/**
		 * Property used by advanced filter class to check if model is compatible
		 *
		 * @cfg {Boolean}
		 */
		isFilterAdvancedCompatible: true,

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CONFIGURATION, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENTRY_TYPE, type: 'string' }, // Entry type name
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TEMPLATE, type: 'boolean' } // Filter is marked as template if it's defined in administration side
		],

		/**
		 * Implementation of model get custom routines:
		 * - on get description if description is empty return name property
		 *
		 * @param {String} propertyName
		 *
		 * @returns {Mixed}
		 *
		 * @override
		 */
		get: function (propertyName) {
			switch (propertyName) {
				case CMDBuild.core.constants.Proxy.DESCRIPTION:
					return this.callParent(arguments) || this.get(CMDBuild.core.constants.Proxy.NAME) || '';

				default:
					return this.callParent(arguments);
			}
		},

		/**
		 * @returns {Array} parameters
		 */
		getEmptyRuntimeParameters: function () {
			var parameters = [];

			this.findParameters(
				this.get(CMDBuild.core.constants.Proxy.CONFIGURATION)[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters,
				true
			);

			return parameters;
		},

		/**
		 * Recursive method to find all filter parameters with parameterType
		 *
		 * @param {Object} configuration
		 * @param {String} parameterType
		 * @param {Array} parameters
		 * @param {Boolean} onlyWithEmptyValue
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		findParameters: function (configuration, parameterType, parameters, onlyWithEmptyValue) {
			onlyWithEmptyValue = Ext.isBoolean(onlyWithEmptyValue) ? onlyWithEmptyValue : false;

			if (
				Ext.isObject(configuration) && !Ext.Object.isEmpty(configuration)
				&& Ext.isString(parameterType) && !Ext.isEmpty(parameterType)
				&& Ext.isArray(parameters)
			) {
				if (Ext.isObject(configuration.simple)) {
					var configurationParameter = configuration.simple;

					if (configurationParameter.parameterType == parameterType) {
						if (onlyWithEmptyValue)
							return Ext.Object.isEmpty(configurationParameter.value) ? parameters.push(configurationParameter) : null;

						return parameters.push(configurationParameter);
					}
				} else if (Ext.isArray(configuration.and) || Ext.isArray(configuration.or)) {
					var attributes = configuration.and || configuration.or;

					if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
						Ext.Array.each(attributes, function (attributeObject, i, allAttributeObjects) {
							this.findParameters(attributeObject, parameterType, parameters, onlyWithEmptyValue);
						}, this);
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		resetRuntimeParametersValue: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters
			);

			Ext.Array.each(parameters, function (parameterObject, i, allParameterObjects) {
				if (Ext.isObject(parameterObject) && !Ext.Object.isEmpty(parameterObject))
					parameterObject[CMDBuild.core.constants.Proxy.VALUE] = [];
			}, this);

			this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
		},

		/**
		 * @returns {Void}
		 */
		resolveCalculatedParameters: function () {
			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION);
			var parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE] || {},
				CMDBuild.core.constants.Proxy.CALCULATED,
				parameters
			);

			if (Ext.isArray(parameters) && !Ext.isEmpty(parameters)) {
				Ext.Array.each(parameters, function (claculatedParameter, i, allCalculatedParameters) {
					if (Ext.isObject(claculatedParameter) && !Ext.Object.isEmpty(claculatedParameter))
						claculatedParameter = this.resolveCalculatedParameterValue(claculatedParameter);
				}, this);

				this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
			}
		},

		/**
		 * @param {Object} parameter
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		resolveCalculatedParameterValue: function (parameter) {
			if (Ext.isObject(parameter) && !Ext.Object.isEmpty(parameter))
				switch (parameter.value[0]) {
					case '@MY_USER': {
						parameter.value[0] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.USER_ID));
					} break;

					case '@MY_GROUP': {
						parameter.value[0] = String(CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_ID));
					} break;
				}

			return parameter;
		},

		/**
		 * @param {Object} valuesObject
		 *
		 * @returns {Void}
		 */
		setRuntimeParameterValue: function (valuesObject) {
			// Error handling
				if (!Ext.isObject(valuesObject) || Ext.Object.isEmpty(valuesObject))
					return _error('setRuntimeParameterValue(): unmanaged parameter', this, valuesObject);
			// END: Error handling

			var configuration = this.get(CMDBuild.core.constants.Proxy.CONFIGURATION),
				parameters = [];

			this.findParameters(
				configuration[CMDBuild.core.constants.Proxy.ATTRIBUTE],
				CMDBuild.core.constants.Proxy.RUNTIME,
				parameters,
				true
			);

			Ext.Array.each(parameters, function (parameterObject, i, allParameterObjects) {
				if (Ext.isObject(parameterObject) && !Ext.Object.isEmpty(parameterObject)) {
					var value = valuesObject[parameterObject[CMDBuild.core.constants.Proxy.ATTRIBUTE]];

					if (!Ext.isEmpty(value))
						parameterObject[CMDBuild.core.constants.Proxy.VALUE] = [value];
				}
			}, this);

			this.set(CMDBuild.core.constants.Proxy.CONFIGURATION, configuration);
		}
	});

})();
