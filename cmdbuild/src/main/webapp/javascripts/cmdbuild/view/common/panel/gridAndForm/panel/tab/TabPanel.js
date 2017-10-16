(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.tab.TabPanel', {
		extend: 'Ext.tab.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.tab.Tab}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		cls: 'cmdb-blue-panel-no-padding',
		border: true,
		frame: false,
		plain: true
	});

})();
