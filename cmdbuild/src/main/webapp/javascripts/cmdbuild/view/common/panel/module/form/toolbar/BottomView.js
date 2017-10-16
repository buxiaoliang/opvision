(function () {

	/**
	 * Required managed functions:
	 * 	- onPanelModuleFormToolbarBottomSaveButtonClick
	 */
	Ext.define('CMDBuild.view.common.panel.module.form.toolbar.BottomView', {
		extend: 'CMDBuild.view.common.panel.module.form.toolbar.gridAndForm.BottomView',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.form.toolbar.Bottom}
		 */
		delegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					Ext.create('CMDBuild.core.buttons.text.Save', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onPanelModuleFormToolbarBottomSaveButtonClick');
						}
					}),
					Ext.create('CMDBuild.core.buttons.text.Abort', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onPanelModuleFormToolbarBottomAbortButtonClick');
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
