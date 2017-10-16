(function() {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.common.attributes.Attribute
	 */
	Ext.define('CMDBuild.model.management.workflow.Attribute', {
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

		statics: {
			/**
			 * Static function to convert from legacy object to model's one
			 *
			 * @param {Object} data
			 *
			 * @returns {Object} data
			 */
			convertFromLegacy: function (data) {
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

				return data;
			}
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data = this.statics().convertFromLegacy(data);

			this.callParent(arguments);
		},

		/**
		 * Create a translation layer to adapt old CMDBuild field definition with new one.
		 * To avoid this should be necessary to refactor FieldManager class.
		 *
		 * @returns {Object}
		 */
		getAdaptedData: function () {
			var objectModel = this.getData();

			objectModel['fieldmode'] = this.get(CMDBuild.core.constants.Proxy.WRITABLE) ? 'write' : 'read';
			objectModel['fieldmode'] = this.get(CMDBuild.core.constants.Proxy.HIDDEN) ? CMDBuild.core.constants.Proxy.HIDDEN : objectModel['fieldmode'];
			objectModel['isbasedsp'] = this.get(CMDBuild.core.constants.Proxy.SHOW_COLUMN);
			objectModel['isnotnull'] = this.get(CMDBuild.core.constants.Proxy.MANDATORY);

			switch (objectModel[CMDBuild.core.constants.Proxy.TYPE]) {
				case 'lookup': {
					objectModel['lookup'] = this.get(CMDBuild.core.constants.Proxy.LOOKUP_TYPE);
					objectModel['lookupchain'] = _CMCache.getLookupchainForType(this.get(CMDBuild.core.constants.Proxy.LOOKUP_TYPE));
				} break;

				case 'reference': {
					objectModel['referencedClassName'] = this.get(CMDBuild.core.constants.Proxy.TARGET_CLASS);
					objectModel[CMDBuild.core.constants.Proxy.META] = {};

					// New filter object structure adapter
					if (!Ext.isEmpty(this.get(CMDBuild.core.constants.Proxy.FILTER))) {
						objectModel[CMDBuild.core.constants.Proxy.FILTER] = this.get(CMDBuild.core.constants.Proxy.FILTER)[CMDBuild.core.constants.Proxy.EXPRESSION];

						Ext.Object.each(this.get(CMDBuild.core.constants.Proxy.FILTER)[CMDBuild.core.constants.Proxy.CONTEXT], function (key, value, myself) {
							objectModel[CMDBuild.core.constants.Proxy.META]['system.template.' + key] = value;
						}, this);
					}
				} break;
			}

			objectModel[CMDBuild.core.constants.Proxy.TYPE] = this.get(CMDBuild.core.constants.Proxy.TYPE).toUpperCase();

			return objectModel;
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