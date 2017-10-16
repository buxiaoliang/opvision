(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.GridAndForm', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		mixins: ['CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ExpansionMode'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Object}
		 */
		form: undefined,

		/**
		 * @property {Object}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.GridAndFormView}
		 */
		view: undefined
	});

})();
