(function () {

	/**
	 * @link GridAndForm structure
	 */
	Ext.define('CMDBuild.view.common.panel.module.form.toolbar.gridAndForm.BottomView', {
		extend: 'Ext.toolbar.Toolbar',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.form.toolbar.gridAndForm.Bottom}
		 */
		delegate: undefined,

		dock: 'bottom',
		ui: 'footer',

		layout: {
			type: 'hbox',
			align: 'middle',
			pack: 'center'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, { itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM });

			this.callParent(arguments);
		}
	});

})();
