(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Bottom', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.Bottom',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel}
		 */
		parentDelegate: undefined,

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.BottomView'
		},

		/**
		 * @cfg {CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.BottomView}
		 */
		view: undefined
	});

})();
