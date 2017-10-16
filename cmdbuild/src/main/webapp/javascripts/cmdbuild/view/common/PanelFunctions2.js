(function () {

	/**
	 * Service class to be used as mixin for Ext.form.Panel or some methods are compatible also with Ext.panel.Panel
	 *
	 * Specific managed properties:
	 * 	- {Boolean} disablePanelFunctions: disable PanelFunctions class actions on processed item (old name: considerAsFieldToDisable)
	 * 	- {Boolean} enablePanelFunctions: enable PanelFunctions class actions on processed item
	 * 	- {Boolean} forceDisabled: force item to be disabled
	 *
	 * @version 2
	 *
	 * TODO: move to PanelFunctions class on complete refactor
	 */
	Ext.define('CMDBuild.view.common.PanelFunctions2', {

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @param {Object} field
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isPanelFunctionManagedField: function (field) {
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
					|| (Ext.isBoolean(field.considerAsFieldToDisable) && field.considerAsFieldToDisable) /** @deprecated */
				)
			);
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.includeDisabled
		 * @param {Ext.component.Component} parameters.target
		 *
		 * @returns {Object}
		 */
		panelFunctionDataGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.includeDisabled = Ext.isBoolean(parameters.includeDisabled) ? parameters.includeDisabled : false;
			parameters.target = Ext.isObject(parameters.target) ? parameters.target : this;

			var values = Ext.isFunction(parameters.target.getForm) ? parameters.target.getForm().getValues() : {};

			if (parameters.includeDisabled) {
				var data = {};

				parameters.target.cascade(function (item) {
					if (
						this.isPanelFunctionManagedField(item)
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
		 * @param {Object} parameters
		 * @param {Boolean} parameters.includeDisabled
		 * @param {String} parameters.propertyName
		 *
		 * @returns {Mixed}
		 */
		panelFunctionValueGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.includeDisabled = Ext.isBoolean(parameters.includeDisabled) ? parameters.includeDisabled : true;

			// Error handling
				if (!Ext.isString(parameters.propertyName) || Ext.isEmpty(parameters.propertyName))
					return _error('panelFunctionValueGet(): unmanaged propertyName parameter', this, parameters.propertyName);
			// END: Error handling

			return this.panelFunctionDataGet({ includeDisabled: parameters.includeDisabled })[parameters.propertyName];
		}
	});

})();
