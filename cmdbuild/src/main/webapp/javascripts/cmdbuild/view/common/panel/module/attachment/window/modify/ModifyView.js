(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.modify.ModifyView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Modify}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.FormPanel}
		 */
		form: undefined,

		closeAction: 'hide',
		dimensionsMode: 'percentage',
		overflowY: 'auto',
		title: CMDBuild.Translation.modifyAttachment,

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
									this.delegate.cmfg('onPanelModuleAttachmentWindowModifyConfirmButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentWindowModifyAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('CMDBuild.view.common.panel.module.attachment.window.modify.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
