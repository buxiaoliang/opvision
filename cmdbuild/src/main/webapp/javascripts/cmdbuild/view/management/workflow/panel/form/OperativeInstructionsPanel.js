(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel',
		border: false,
		cls: 'cmdb-border-left',
		collapsed: true,
		collapsible: true,
		frame: false,
		overflowY: 'auto',
		region: 'east',
		split: true,
		title: CMDBuild.Translation.operativeInstructions,
		width: '30%'
	});

})();
