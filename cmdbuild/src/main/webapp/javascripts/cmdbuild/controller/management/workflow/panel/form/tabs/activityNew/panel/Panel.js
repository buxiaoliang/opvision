(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel', {
		extend: 'CMDBuild.controller.common.panel.module.form.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.Tab}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.FieldsTab}
		 */
		controllerPanelTab: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Bottom}
		 */
		controllerToolbarBottom: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			panelTab: 'CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.FieldsTab',
			toolbarBottom: 'CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Bottom',
			toolbarTop: 'CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Top',
			view: 'CMDBuild.view.common.panel.module.form.panel.PanelView'
		}
	});

})();
