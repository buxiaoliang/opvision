(function () {

	Ext.define('CMDBuild.view.common.field.display.DetailsWindow', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		/**
		 * @property {Ext.form.field.Display}
		 */
		displayField: undefined,

		border: true,
		bodyCls: 'cmdb-blue-panel',
		closeAction: 'hide',
		frame: false,
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
									this.close();
								}
							})
						]
					})
				],
				items: [
					this.displayField = Ext.create('Ext.form.field.Display')
				]
			});

			this.callParent(arguments);
		},

		/**
		 * Set value after show to have the targetElement for the addTargetToLinks() of field Display
		 *
		 * @param {String} value
		 *
		 * @returns {Void}
		 */
		configureAndShow: function (value) {
			this.displayField.setValue(value);

			this.show();
		}
	});

})();
