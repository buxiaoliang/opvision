(function () {

	Ext.define('CMDBuild.view.management.workflow.WorkflowView', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.GridAndFormView',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.Workflow}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.processes,

		title: CMDBuild.Translation.processes
	});

})();
