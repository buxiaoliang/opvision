(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.card.panel.Panel', {
		extend: 'CMDBuild.controller.common.panel.module.form.panel.Panel',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.form.panel.FieldsTab}
		 */
		controllerPanelTab: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Bottom}
		 */
		controllerToolbarBottom: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			panelTab: 'CMDBuild.controller.common.panel.module.form.panel.FieldsTab',
			toolbarBottom: 'CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Bottom',
			toolbarTop: 'CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Top',
			view: 'CMDBuild.view.common.panel.module.form.panel.PanelView'
		},

		/**
		 * @property {CMDBuild.view.common.panel.module.form.panel.PanelView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		panelModuleFormPanelUiUpdate: function () {
			// Forward to sub-controllers
			this.controllerToolbarBottom.cmfg('panelModuleFormToolbarBottomUiUpdate');
			this.controllerToolbarTop.cmfg('classesFormTabCardToolbarTopUiUpdate');
		}
	});

})();
