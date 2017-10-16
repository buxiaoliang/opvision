(function () {

	Ext.define('CMDBuild.view.common.panel.module.widget.panel.ButtonGroupView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel',
		border: false,
		cls: 'cmdb-border-left',
		frame: false,
		hidden: true,
		overflowY: 'auto',
		padding: '30 0 0 0',
		region: 'east',

	});

})();
