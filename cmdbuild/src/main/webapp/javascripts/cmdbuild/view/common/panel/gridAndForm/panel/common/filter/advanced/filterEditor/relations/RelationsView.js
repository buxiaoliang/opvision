(function () {

	/**
	 * @link CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.RelationsView
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.RelationsView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.Relations}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		layout: 'border',
		title: CMDBuild.Translation.relations
	});

})();
