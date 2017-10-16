(function () {

	Ext.require(['CMDBuild.core.constants.Proxy']);

	/**
	 * @link GridAndForm structure
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.toolbar.gridAndForm.ToolbarFunctions', {

		/**
		 * Extension of PanelFunctions v3
		 *
		 * @param {Object} parameters
		 * @param {Boolean} parameters.ignoreForceDisabled
		 * @param {Boolean} parameters.state
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsToolbarFunctionsDisabledStateSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.ignoreForceDisabled = Ext.isBoolean(parameters.ignoreForceDisabled) ? parameters.ignoreForceDisabled : false;
			parameters.state = Ext.isBoolean(parameters.state) ? parameters.state : true;

			// Error handling
				if (!Ext.isObject(this.view) || Ext.Object.isEmpty(this.view))
					return _error('panelGridAndFormMixinsToolbarFunctionsDisabledStateSet(): unmanaged view property', this, this.view);
			// END: Error handling

			if (Ext.isObject(this.view.items) && !Ext.Object.isEmpty(this.view.items))
				this.view.items.each(function (item, i, len) {
					if (
						Ext.isObject(item) && !Ext.Object.isEmpty(item)
						&& !item.disablePanelFunctions
						&& (
							item instanceof Ext.button.Button
							|| (Ext.isBoolean(item.enablePanelFunctions) && item.enablePanelFunctions)
						)
						&& Ext.isFunction(item.setDisabled)
					) {
						item.setDisabled(Ext.isBoolean(item.forceDisabled) && item.forceDisabled && !parameters.ignoreForceDisabled ? true : parameters.state);
					}
				}, this);
		}
	});

})();
