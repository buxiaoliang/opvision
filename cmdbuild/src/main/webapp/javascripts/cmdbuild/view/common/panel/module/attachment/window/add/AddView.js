(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.add.AddView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Add}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.FormPanel}
		 */
		form: undefined,

		closeAction: 'hide',
		dimensionsMode: 'percentage',
		overflowY: 'auto',
		title: CMDBuild.Translation.addAttachment,

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

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
							Ext.create('CMDBuild.core.buttons.text.Confirm', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentWindowAddConfirmButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentWindowAddAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.common.panel.module.attachment.window.add.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
