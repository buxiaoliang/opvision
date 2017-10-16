(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel', {
		extend: 'Ext.form.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.form.Form}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: false,
		cls: 'cmdb-border-top',
		frame: false,
		height: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.CARD_FORM_RATIO) + '%',
		region: 'south',
		split: true
	});

})();
