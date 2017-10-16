(function () {

	Ext.define('CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.templateResolver.Utils',
			'CMDBuild.proxy.common.field.filter.RuntimeParameters'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldFilterRuntimeParametersShow',
			'onFieldFilterRuntimeParametersAbortButtonClick',
			'onFieldFilterRuntimeParametersApplyButtonClick'
		],

		/**
		 * @parameter {CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter}
		 */
		filter: undefined,

		/**
		 * @property {CMDBuild.view.common.field.filter.runtimeParameters.RuntimeParametersWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {Object} configObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.field.filter.runtimeParameters.RuntimeParametersWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @param {Array} runtimeParameters
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFields: function (runtimeParameters) {
			this.form.removeAll();

			if (Ext.isArray(runtimeParameters) && !Ext.isEmpty(runtimeParameters)) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this });

				Ext.Array.each(runtimeParameters, function (runtimeParameter, i, allRuntimeParameters) {
					if (fieldManager.isAttributeManaged(runtimeParameter[CMDBuild.core.constants.Proxy.TYPE])) {
						fieldManager.attributeModelSet(Ext.create('CMDBuild.model.common.attributes.Attribute', runtimeParameter));
						fieldManager.add(this.form, fieldManager.buildField());
					} else { // @deprecated - Old field manager
						runtimeParameter = this.validateFilterProperty(runtimeParameter);

						var field = CMDBuild.Management.FieldManager.getFieldForAttr(runtimeParameter, false, false);

						if (!Ext.isEmpty(field)) {
							field.maxWidth = field.width || CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM;

							if (runtimeParameter.defaultvalue)
								field.setValue(runtimeParameter.defaultvalue);

							this.form.add(field);
						}
					}
				}, this);
			} else {
				_error('buildFields(): unmanaged runtime parameters property', this, runtimeParameters);
			}
		},

		/**
		 * @param {Ext.data.Model} filter
		 *
		 * @returns {Void}
		 */
		fieldFilterRuntimeParametersShow: function (filter) {
			this.filter = undefined;

			if (
				Ext.isObject(filter) && !Ext.Object.isEmpty(filter)
				&& Ext.isBoolean(filter.isFilterAdvancedCompatible) && filter.isFilterAdvancedCompatible
				&& Ext.isObject(this.view) && !Ext.Object.isEmpty(this.view)
			) {
				var runtimeParameters = filter.getEmptyRuntimeParameters();
				var runtimeParametersNames = [];

				Ext.Array.each(runtimeParameters, function (runtimeParameter, i, allRuntimeParameters) {
					if (
						Ext.isObject(runtimeParameter) && !Ext.Object.isEmpty(runtimeParameter)
						&& !Ext.isEmpty(runtimeParameter[CMDBuild.core.constants.Proxy.ATTRIBUTE])
					) {
						runtimeParametersNames.push(runtimeParameter[CMDBuild.core.constants.Proxy.ATTRIBUTE]);
					}
				}, this);

				if (Ext.isArray(runtimeParameters) && !Ext.isEmpty(runtimeParameters)) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = filter.get(CMDBuild.core.constants.Proxy.ENTRY_TYPE);

					CMDBuild.proxy.common.field.filter.RuntimeParameters.readAllAttributes({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

							var runtimeParametersAttributes = [];

							if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
								Ext.Array.each(decodedResponse, function (attributeObject, i, allAttributeObjects) {
									if (
										Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject)
										&& Ext.Array.contains(runtimeParametersNames, attributeObject[CMDBuild.core.constants.Proxy.NAME])
									) {
										runtimeParametersAttributes.push(Ext.apply(attributeObject, { fieldmode: 'write' })); // Force writable to be editable by user
									}
								}, this);

								this.buildFields(runtimeParametersAttributes);
								this.setViewTitle(filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION));

								this.filter = filter;

								this.view.show();
							}
						}
					});
				} else {
					_error('fieldFilterRuntimeParametersShow(): no runtime parameters found in filter object', this, filter);
				}
			} else {
				_error('fieldFilterRuntimeParametersShow(): unmanaged filter object', this, filter);
			}
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterRuntimeParametersAbortButtonClick: function () {
			this.cmfg('workflowTreeFilterClear');

			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterRuntimeParametersApplyButtonClick: function () {
			if (this.form.getForm().isValid()) {
				this.filter.setRuntimeParameterValue(this.form.getValues());

				this.cmfg('workflowTreeFilterApply', {
					filter: this.filter,
					type: 'advanced'
				});

				this.view.close();
			}
		},

		/**
		 * Removes filter property if present template
		 *
		 * @param {Object} attribute
		 *
		 * @returns {Object} attribute
		 *
		 * @private
		 */
		validateFilterProperty: function (attribute) {
			if (
				Ext.isObject(attribute) && !Ext.Object.isEmpty(attribute)
				&& Ext.isString(attribute[CMDBuild.core.constants.Proxy.FILTER]) && !Ext.isEmpty(attribute[CMDBuild.core.constants.Proxy.FILTER])
				&& CMDBuild.core.templateResolver.Utils.hasTemplates(attribute[CMDBuild.core.constants.Proxy.FILTER])
			) {
				attribute[CMDBuild.core.constants.Proxy.FILTER] = null;
			}

			return attribute;
		}
	});

})();
