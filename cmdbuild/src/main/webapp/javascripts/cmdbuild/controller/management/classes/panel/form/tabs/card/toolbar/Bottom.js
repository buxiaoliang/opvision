(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Bottom', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.Bottom',

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.card.Tab}
		 */
		parentDelegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onPanelModuleFormToolbarBottomAbortButtonClick: function () {
			var params = {};

			if (!this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'clone': {
					if (!this.cmfg('panelGridAndFormSelectedPreviousItemIsEmpty')) {
						params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
						params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('panelGridAndFormSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ID);
					}
				} break;

				case 'edit': {
					if (!this.cmfg('panelGridAndFormSelectedItemIsEmpty')) {
						params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
						params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
					}
				} break;
			}

			this.cmfg('panelGridAndFormUiUpdate', params);

			// Synchronize grid selection
			this.parentDelegate.parentDelegate.parentDelegate.gridController.openCard({
				Id: this.cmfg('panelGridAndFormSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ID),
				IdClass: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID) // Required selectedEntity because of error with columns
			}, true);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		panelModuleFormToolbarBottomUiUpdate: function () {
			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'clone':
				case 'edit':
					return this.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: false });

				case 'read':
				default:
					return this.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: true });
			}
		}
	});

})();
