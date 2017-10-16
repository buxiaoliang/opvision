(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.WindowView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Window}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.FormPanel}
		 */
		form: undefined,

		baseTitle: CMDBuild.Translation.attachment,
		closeAction: 'hide',
		dimensionsMode: 'percentage',
		layout: 'fit',
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Close', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentWindowCloseButtonClick');
								}
							})
						]
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
