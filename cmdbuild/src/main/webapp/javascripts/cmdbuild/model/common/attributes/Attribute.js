(function() {

	Ext.require(['CMDBuild.core.constants.Proxy']);

	Ext.define('CMDBuild.model.common.attributes.Attribute', {
		extend: 'Ext.data.Model',

		/**
		 * Property used by field manager (CMDBuild.core.fieldManager.FieldManager) to check if model is compatible
		 *
		 * @cfg {Boolean}
		 */
		isFieldManagerCompatible: true,

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EDITOR_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.GROUP, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.HIDDEN, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.INDEX, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.LENGTH, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.LOOKUP_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MANDATORY, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PRECISION, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.SCALE, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.SHOW_COLUMN, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.SORT_DIRECTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.SORT_INDEX, type: 'int', defaultValue: 0 },
			{ name: CMDBuild.core.constants.Proxy.SOURCE_OBJECT, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.TARGET_CLASS, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', convert: toLowerCase }, // Case insensitive types
			{ name: CMDBuild.core.constants.Proxy.UNIQUE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.VALUES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.WRITABLE, type: 'boolean', defaultValue: true }
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
			data[CMDBuild.core.constants.Proxy.SOURCE_OBJECT] = Ext.clone(data); // FIXME: clone clean source object legacy mode with old field manager
			data[CMDBuild.core.constants.Proxy.LENGTH] = data['len'] || data[CMDBuild.core.constants.Proxy.LENGTH];
			data[CMDBuild.core.constants.Proxy.LOOKUP_TYPE] = data[CMDBuild.core.constants.Proxy.LOOKUP] || data[CMDBuild.core.constants.Proxy.LOOKUP_TYPE];
			data[CMDBuild.core.constants.Proxy.MANDATORY] = Ext.isBoolean(data['isnotnull']) ? data['isnotnull'] : data[CMDBuild.core.constants.Proxy.MANDATORY];
			data[CMDBuild.core.constants.Proxy.SHOW_COLUMN] = Ext.isBoolean(data['isbasedsp']) ? data['isbasedsp'] : data[CMDBuild.core.constants.Proxy.SHOW_COLUMN];
			data[CMDBuild.core.constants.Proxy.TARGET_CLASS] = data['referencedClassName'] || data['fkDestination'] || data[CMDBuild.core.constants.Proxy.TARGET_CLASS]; // ForeignKey's specific
			data[CMDBuild.core.constants.Proxy.UNIQUE] = Ext.isBoolean(data['isunique']) ? data['isunique'] : data[CMDBuild.core.constants.Proxy.UNIQUE];

			/*
			 * Sort decode
			 *	- classOrderSign: sorting direction
			 *		-1: ASC
			 *		0: not used
			 *		1: DESC
			 * 	- absoluteClassOrder: sorting criteria's index
			 */
			if (
				Ext.isNumber(data['classOrderSign']) && !Ext.isEmpty(data['classOrderSign'])
				&& Ext.isNumber(data['absoluteClassOrder']) && !Ext.isEmpty(data['absoluteClassOrder'])
			) {
				var sortIndex = data['classOrderSign'] * data['absoluteClassOrder'];

				data[CMDBuild.core.constants.Proxy.SORT_INDEX] = sortIndex;

				if (sortIndex > 0) {
					data[CMDBuild.core.constants.Proxy.SORT_DIRECTION] = 'ASC';
				} else if (sortIndex < 0) {
					data[CMDBuild.core.constants.Proxy.SORT_DIRECTION] = 'DESC';
				}
			}

			// Field mode decode
			switch (data['fieldmode']) {
				case CMDBuild.core.constants.Proxy.HIDDEN: {
					data[CMDBuild.core.constants.Proxy.HIDDEN] = true;
				} break;

				case CMDBuild.core.constants.Proxy.READ: {
					data[CMDBuild.core.constants.Proxy.WRITABLE] = false;
				} break;

				case CMDBuild.core.constants.Proxy.WRITE: {
					data[CMDBuild.core.constants.Proxy.WRITABLE] = true;
				} break;
			}

			this.callParent(arguments);
		},

		/**
		 * @returns {Boolean}
		 */
		isValid: function() {
			var customValidationValue = true;

			switch (this.get(CMDBuild.core.constants.Proxy.TYPE)) {
				case 'decimal': {
					customValidationValue = (
						!Ext.isEmpty(this.get(CMDBuild.core.constants.Proxy.SCALE))
						&& !Ext.isEmpty(this.get(CMDBuild.core.constants.Proxy.PRECISION))
						&& this.get(CMDBuild.core.constants.Proxy.SCALE) <= this.get(CMDBuild.core.constants.Proxy.PRECISION)
					);
				} break;

				case 'foreignkey': {
					customValidationValue = (
						!Ext.isEmpty(this.get(CMDBuild.core.constants.Proxy.TARGET_CLASS))
					);
				} break;

				case 'string': {
					customValidationValue = (
						!Ext.isEmpty(this.get(CMDBuild.core.constants.Proxy.LENGTH))
						&& this.get(CMDBuild.core.constants.Proxy.LENGTH) > 0
					);
				} break;
			}

			return this.callParent(arguments) && customValidationValue;
		}
	});

	/**
	 * @param {String} value
	 * @param {Object} record
	 *
	 * @returns {String}
	 *
	 * @private
	 */
	function toLowerCase(value, record) {
		return value.toLowerCase();
	}

})();
