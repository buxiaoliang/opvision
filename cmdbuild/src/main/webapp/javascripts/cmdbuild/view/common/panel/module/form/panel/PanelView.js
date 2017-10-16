(function () {

	Ext.define('CMDBuild.view.common.panel.module.form.panel.PanelView', {
		extend: 'Ext.form.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		bodyStyle: 'padding: 5px 5px 0px 5px;',
		border: false,
		cls: 'x-panel-body-default-framed',
		frame: false,
		layout: 'fit',
		region: 'center'
	});

})();
