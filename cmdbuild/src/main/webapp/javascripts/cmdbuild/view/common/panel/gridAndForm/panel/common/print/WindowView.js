(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.print.WindowView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		border: true,
		closeAction: 'hide',
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.printPreview,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							'->',
							Ext.create('CMDBuild.core.buttons.iconized.Download', {
								scope: this,

								handler: function(button, e) {
									this.delegate.cmfg('onPanelGridAndFormPrintWindowDownloadButtonClick');
								}
							})
						]
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (window, eOpts) {
				this.delegate.cmfg('onPanelGridAndFormPrintWindowShow');
			}
		}
	});

})();
