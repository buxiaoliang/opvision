(function () {

	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ManageTab', {

		/**
		 * @param {Object} parameters
		 * @param {Ext.tab.Panel} parameters.target
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsManageTabActiveFireShowEvent: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.target) || Ext.Object.isEmpty(parameters.target) || !parameters.target instanceof Ext.tab.Panel)
					return _error('panelGridAndFormMixinsManageTabActiveFireShowEvent(): unmanaged target parameter', this, parameters.target);
			// END: Error handling

			if (!this.cmfg('panelGridAndFormMixinsManageTabActiveIsEmpty', parameters))
				parameters.target.getActiveTab().fireEvent('show');
		},

		/**
		 * @param {Object} parameters
		 * @param {Ext.tab.Panel} parameters.target
		 *
		 * @returns {Boolean}
		 */
		panelGridAndFormMixinsManageTabActiveIsEmpty: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.target) || Ext.Object.isEmpty(parameters.target) || !parameters.target instanceof Ext.tab.Panel)
					return _error('panelGridAndFormMixinsManageTabActiveIsEmpty(): unmanaged target parameter', this, parameters.target);
			// END: Error handling

			var activeTab = parameters.target.getActiveTab();

			return Ext.isEmpty(activeTab) || activeTab.isDisabled();
		},

		/**
		 * @param {Object} parameters
		 * @param {Object or String or Number} parameters.tabToSelect
		 * @param {Ext.tab.Panel} parameters.target
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsManageTabActiveSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.tabToSelect = Ext.isEmpty(parameters.tabToSelect) ? 0 : parameters.tabToSelect;

			// Error handling
				if (!Ext.isObject(parameters.target) || Ext.Object.isEmpty(parameters.target) || !parameters.target instanceof Ext.tab.Panel)
					return _error('panelGridAndFormMixinsManageTabActiveSet(): unmanaged target parameter', this, parameters.target);
			// END: Error handling

			parameters.target.setActiveTab(parameters.tabToSelect);

			this.cmfg('panelGridAndFormMixinsManageTabActiveFireShowEvent', parameters);
		},

		/**
		 * @param {Object} parameters
		 * @param {Ext.tab.Panel} parameters.target
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsManageTabSelection: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.target) || Ext.Object.isEmpty(parameters.target) || !parameters.target instanceof Ext.tab.Panel)
					return _error('panelGridAndFormMixinsManageTabSelection(): unmanaged target parameter', this, parameters.target);
			// END: Error handling

			if (this.cmfg('panelGridAndFormMixinsManageTabActiveIsEmpty', parameters))
				this.cmfg('panelGridAndFormMixinsManageTabActiveSet', parameters);

			this.cmfg('panelGridAndFormMixinsManageTabActiveFireShowEvent', parameters);
		}
	});

})();
