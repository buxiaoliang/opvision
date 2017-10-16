(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.widget.panel.ButtonGroup', {
		extend: 'CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.Tab}
		 */
		parentDelegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		panelModuleWidgetButtonGroupUiUpdate: function () {
			// UI reset
			this.cmfg('panelModuleWidgetButtonGroupReset');

			// Forward to sub-controllers
			if (!this.cmfg('panelGridAndFormSelectedItemWidgetsIsEmpty'))
				this.controllerWidgetManager.buildControllers(
					Ext.create('CMDBuild.model.CMActivityInstance', this.cmfg('workflowSelectedActivityGet', 'rawData'))
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
