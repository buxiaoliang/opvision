(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.Message',
		'Ext.ux.form.MultiSelect'
	]);

	/**
	 * Service class to be used as mixin for Ext.form.Panel or some methods are compatible also with Ext.panel.Panel
	 *
	 * Specific managed properties:
	 * 	- {Boolean} disablePanelFunctions: disable PanelFunctions class actions on processed item (old name: considerAsFieldToDisable)
	 * 	- {Boolean} enablePanelFunctions: enable PanelFunctions class actions on processed item
	 * 	- {Boolean} forceDisabled: force item to be disabled
	 *
	 * @version 3
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.mixins.PanelFunctions', {

		/**
		 * @param {Object} field
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		panelGridAndFormMixinsPanelFunctionsFieldIsManaged: function (field) {
			return (
				Ext.isObject(field) && !Ext.Object.isEmpty(field)
				&& !field.disablePanelFunctions
				&& (
					field instanceof Ext.button.Button
					|| field instanceof Ext.form.Field
					|| field instanceof Ext.form.field.Base
					|| field instanceof Ext.form.FieldContainer
					|| field instanceof Ext.form.FieldSet
					|| field instanceof Ext.ux.form.MultiSelect
					|| (Ext.isBoolean(field.enablePanelFunctions) && field.enablePanelFunctions)
				)
			);
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.ignoreForceDisabled
		 * @param {Boolean} parameters.ignoreIsVisibleCheck
		 * @param {Boolean} parameters.state
		 * @param {Ext.component.Component} parameters.target
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsPanelFunctionsManagedFieldsDisabledSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.ignoreForceDisabled = Ext.isBoolean(parameters.ignoreForceDisabled) ? parameters.ignoreForceDisabled : false;
			parameters.ignoreIsVisibleCheck = Ext.isBoolean(parameters.ignoreIsVisibleCheck) ? parameters.ignoreIsVisibleCheck : true;
			parameters.state = Ext.isBoolean(parameters.state) ? parameters.state : true;
			parameters.target = Ext.isObject(parameters.target) ? parameters.target : this.view;

			// Error handling
				if (!Ext.isFunction(parameters.target.cascade))
					return _error('panelGridAndFormMixinsPanelFunctionsManagedFieldsDisabledSet(): unmanaged target component parameter', this, parameters.target);
			// END: Error handling

			parameters.target.cascade(function (item) {
				if (
					this.panelGridAndFormMixinsPanelFunctionsFieldIsManaged(item)
					&& (item.isVisible() || parameters.ignoreIsVisibleCheck)
					&& Ext.isFunction(item.setDisabled)
				) {
					item.setDisabled(Ext.isBoolean(item.forceDisabled) && item.forceDisabled && !parameters.ignoreForceDisabled ? true : parameters.state);
				}
			}, this);
		},

		/**
		 * @returns {Array} nonValidFields
		 */
		panelGridAndFormMixinsPanelFunctionsFieldInvalidGet: function () {
			var nonValidFields = [];

			this.view.cascade(function (item) {
				if (
					this.panelGridAndFormMixinsPanelFunctionsFieldIsManaged(item)
					&& Ext.isFunction(item.isValid) && !item.isValid()
					&& Ext.isFunction(item.isDisabled) && !item.isDisabled()
					&& Ext.isFunction(item.isHidden) && !item.isHidden()
				) {
					nonValidFields.push(item);
				}
			}, this);

			return nonValidFields;
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.includeDisabled
		 * @param {Ext.component.Component} parameters.target
		 *
		 * @returns {Object}
		 */
		panelGridAndFormMixinsPanelFunctionsDataGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.includeDisabled = Ext.isBoolean(parameters.includeDisabled) ? parameters.includeDisabled : false;
			parameters.target = Ext.isObject(parameters.target) ? parameters.target : this.view;

			// GetValues() method converts to string all fields values but overrided from includeDisabled ones
			var values = Ext.isFunction(parameters.target.getForm) ? parameters.target.getForm().getValues() : {};

			if (parameters.includeDisabled) {
				var data = {};

				parameters.target.cascade(function (item) {
					if (
						this.panelGridAndFormMixinsPanelFunctionsFieldIsManaged(item)
						&& Ext.isFunction(item.getValue) && Ext.isFunction(item.getName)
						&& Ext.isBoolean(item.submitValue) && item.submitValue
					) {
						data[item.getName()] = item.getValue();
					}
				}, this);

				return Ext.apply(values, data);
			}

			return values;
		},

		/**
		 * Change state of fieldset's contained fields
		 *
		 * @param {Object} parameters
		 * @param {Boolean} parameters.ignoreForceDisabled
		 * @param {Boolean} parameters.ignoreIsVisibleCheck
		 * @param {Ext.form.FieldSet} parameters.fieldset
		 * @param {Boolean} parameters.state
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsPanelFunctionsFieldSetDisabledSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.state = Ext.isBoolean(parameters.state) ? parameters.state : true;

			// Error handling
				if (!parameters.fieldset instanceof Ext.form.FieldSet)
					return _error('panelGridAndFormPanelFormPanelFunctionsFieldSetDisableStateSet(): unmanaged fieldset parameter', this, parameters.fieldset);
			// END: Error handling

			this.panelGridAndFormMixinsPanelFunctionsManagedFieldsDisabledSet({
				ignoreForceDisabled: parameters.ignoreForceDisabled,
				ignoreIsVisibleCheck: parameters.ignoreIsVisibleCheck,
				state: parameters.state,
				target: parameters.fieldset
			});
		},

		/**
		 * Keeps in sync two fields, usually name and description. If the master field changes and the slave is empty, or it has the same
		 * value as the old value of the master, its value is updated with the new one.
		 *
		 * These function has to be used with the change listener, example:
		 * 		change: function (field, newValue, oldValue, eOpts) {
		 * 			this.fieldSynch(slaveField, newValue, oldValue);
		 * 		}
		 *
		 * @param {Object} parameters
		 * @param {Object} parameters.slaveField
		 * @param {Object} parameters.newValue
		 * @param {Object} parameters.oldValue
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsPanelFunctionsFieldSynch: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.slaveField) || Ext.isEmpty(parameters.slaveField))
					return _error('panelGridAndFormMixinsPanelFunctionsFieldSynch(): unmanaged slaveField parameter', this, parameters.slaveField);
			// END: Error handling

			if (this.panelGridAndFormMixinsPanelFunctionsFieldIsManaged(parameters.slaveField)) {
				var actualValue = parameters.slaveField.getValue();

				if (Ext.isEmpty(actualValue) || actualValue == parameters.oldValue)
					parameters.slaveField.setValue(parameters.newValue);
			}
		},

		/**
		 * Setup modify state of form
		 *
		 * @param {Object} parameters
		 * @param {Boolean} parameters.ignoreForceDisabled
		 * @param {Boolean} parameters.ignoreIsVisibleCheck
		 * @param {Boolean} parameters.state
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsPanelFunctionsFieldsDisabledSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.state = Ext.isBoolean(parameters.state) ? parameters.state : false;

			this.panelGridAndFormMixinsPanelFunctionsManagedFieldsDisabledSet({
				ignoreForceDisabled: parameters.ignoreForceDisabled,
				ignoreIsVisibleCheck: parameters.ignoreIsVisibleCheck,
				state: parameters.state
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.target
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsPanelFunctionsFieldsReset: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.target = Ext.isObject(parameters.target) ? parameters.target : this.view;

			// Error handling
				if (!Ext.isFunction(parameters.target.cascade))
					return _error('panelGridAndFormMixinsPanelFunctionsFieldsReset(): unmanaged cascade function', this, parameters.target);
			// END: Error handling

			parameters.target.cascade(function (item) {
				if (
					this.panelGridAndFormMixinsPanelFunctionsFieldIsManaged(item)
					&& Ext.isFunction(item.setValue) && Ext.isFunction(item.reset)
				) {
					item.setValue();
					item.reset();
				}
			}, this);
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.includeDisabled
		 * @param {String} parameters.propertyName
		 *
		 * @returns {Mixed}
		 */
		panelGridAndFormMixinsPanelFunctionsValueGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.includeDisabled = Ext.isBoolean(parameters.includeDisabled) ? parameters.includeDisabled : true;

			// Error handling
				if (!Ext.isString(parameters.propertyName) || Ext.isEmpty(parameters.propertyName))
					return _error('panelGridAndFormMixinsPanelFunctionsValueGet(): unmanaged propertyName parameter', this, parameters.propertyName);
			// END: Error handling

			return this.panelGridAndFormMixinsPanelFunctionsDataGet({ includeDisabled: parameters.includeDisabled })[parameters.propertyName];
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.enablePopup - enable popup error message
		 * @param {Ext.form.Panel} parameters.target
		 *
		 * @returns {Boolean}
		 */
		panelGridAndFormMixinsPanelFunctionsIsValid: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enablePopup = Ext.isBoolean(parameters.enablePopup) ? parameters.enablePopup : true;
			parameters.target = Ext.isObject(parameters.target) ? parameters.target : this.view;

			var invalidFieldsArray = this.panelGridAndFormMixinsPanelFunctionsFieldInvalidGet();

			// Check for invalid fields and builds errorMessage
			if (Ext.isArray(invalidFieldsArray) && !Ext.isEmpty(invalidFieldsArray)) {
				var errorMessage = '';

				Ext.Array.forEach(invalidFieldsArray, function (invalidField, i, allInvalidFields) {
					if (Ext.isObject(invalidField) && !Ext.Object.isEmpty(invalidField) && Ext.isFunction(invalidField.getFieldLabel)) {
						var label = invalidField.getFieldLabel();

						if (!Ext.isEmpty(label))
							errorMessage += '<li>' + label + '</li>';
					}
				}, this);

				if (parameters.enablePopup)
					CMDBuild.core.Message.error(
						CMDBuild.Translation.common.failure,
						'<b>' + CMDBuild.Translation.errors.invalid_fields + '</b>'
						+ '<ul style="text-align: left;">'
							+ errorMessage
						+ '</ul>',
						false
					);

				return false;
			}

			return true;
		}
	});

})();
