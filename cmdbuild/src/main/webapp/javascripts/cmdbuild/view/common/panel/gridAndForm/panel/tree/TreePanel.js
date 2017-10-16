(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.tree.TreePanel', {
		extend: 'Ext.tree.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.tree.Tree}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-border-bottom',
		forceFit: true,
		frame: false,
		region: 'center',
		rootVisible: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it

		viewConfig: {
			loadMask: true,
			stripeRows: true
		}
	});

})();
