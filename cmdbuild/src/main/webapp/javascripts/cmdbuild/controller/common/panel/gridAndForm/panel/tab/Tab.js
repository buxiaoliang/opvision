(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.tab.Tab', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		mixins: ['CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ManageTab'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.tab.TabPanel}
		 */
		view: undefined
	});

})();
