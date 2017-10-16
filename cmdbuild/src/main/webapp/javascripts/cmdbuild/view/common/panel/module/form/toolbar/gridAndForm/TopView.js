(function () {

	/**
	 * @link GridAndForm structure
	 */
	Ext.define('CMDBuild.view.common.panel.module.form.toolbar.gridAndForm.TopView', {
		extend: 'Ext.toolbar.Toolbar',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.form.toolbar.gridAndForm.Top}
		 */
		delegate: undefined,

		dock: 'top',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, { itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP });

			this.callParent(arguments);
		}
	});

})();
