(function () {

	Ext.define('CMDBuild.view.common.field.trigger.cron.window.EditWindow', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		/**
		 * @cfg {CMDBuild.controller.common.field.trigger.cron.window.Edit}
		 */
		delegate: undefined,

		/**
		 * @cfg {Object}
		 */
		dimensions: {
			height: 'auto',
			width: 360
		},

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'absolute',

		border: true,
		closeAction: 'hide',
		frame: false,
		layout: 'fit',
		resizable: false,

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
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onFieldTriggerCronWindowEditSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onFieldTriggerCronWindowEditAbortButtonClick');
								}
							})
						]
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			beforeshow: function (view, eOpts) {
				return this.delegate.cmfg('onFieldTriggerCronWindowEditBeforeShow');
			}
		}
	});

})();
