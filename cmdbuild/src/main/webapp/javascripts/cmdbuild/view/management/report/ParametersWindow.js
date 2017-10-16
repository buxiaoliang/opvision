(function () {

	Ext.define('CMDBuild.view.management.report.ParametersWindow', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.report.Parameters}
		 */
		delegate: undefined,

		/**
		 * @cfg {Object}
		 */
		dimensions: {
			height: 'auto',
			width: 60
		},

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		/**
		 * @property {Ext.form.Panel}
		 */
		form: undefined,

		baseTitle: CMDBuild.Translation.reportParameters,
		border: true,
		closeAction: 'hide',
		frame: false,
		layout: 'fit',

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
							Ext.create('CMDBuild.core.buttons.text.Print', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onReportParametersWindowPrintButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onReportParametersWindowAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.form = Ext.create('Ext.form.Panel', {
						bodyCls: 'cmdb-blue-panel',
						border: false,
						frame: false,

						layout: {
							type: 'vbox',
							align: 'stretch'
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
