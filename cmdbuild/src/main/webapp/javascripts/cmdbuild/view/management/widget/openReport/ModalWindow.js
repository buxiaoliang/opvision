(function () {

	Ext.define('CMDBuild.view.management.widget.openReport.ModalWindow', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.widget.openReport.Modal}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.report,

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		border: true,
		closeAction: 'hide',
		frame: false,
		layout: 'fit',
		overflowY: true,

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

								handler: function (button, e) {
									this.delegate.cmfg('onWidgetOpenReportModalWindowDownloadButtonClick');
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
