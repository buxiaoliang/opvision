(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.card.widget.panel.ButtonGroup', {
		extend: 'CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.card.Tab}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.widget.panel.ButtonGroupView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 * @override
		 */
		panelModuleWidgetButtonGroupUiUpdate: function () {
			// UI reset
			this.cmfg('panelModuleWidgetButtonGroupReset');

			// Forward to sub-controllers
			if (!this.cmfg('panelGridAndFormSelectedItemWidgetsIsEmpty'))
				this.controllerWidgetManager.buildControllers(
					Ext.create('CMDBuild.model.common.Generic', this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.SOURCE_OBJECT))
				);

			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'edit': {
					this.onCardGoesInEdit();

					this.view.items.each(function (button, i, len) {
						button.enable();
					});
				} break;

				case 'read':
				case 'readOnly':
				default: {
					this.view.items.each(function (button, i, len) {
						button.disable();
					});
				}
			}
		}
	});

})();
