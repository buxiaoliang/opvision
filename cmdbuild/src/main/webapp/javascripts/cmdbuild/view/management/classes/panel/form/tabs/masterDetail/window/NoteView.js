(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.masterDetail.window.NoteView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.masterDetail.window.Note}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.notes,

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		/**
		 * @property {Ext.form.field.Display}
		 */
		fieldNote: undefined,

		border: true,
		bodyCls: 'cmdb-blue-panel',
		closeAction: 'hide',
		frame: false,
		overflowY: 'auto',

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
					this.fieldNote = Ext.create('Ext.form.field.Display')
				]
			});

			this.callParent(arguments);
		}
	});

})();
