(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditWindowWindow', {
		extend: 'Ext.window.Window',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EditWindow}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.text.Abort}
		 */
		abortButton: undefined,

		/**
		 * @property {Ext.button.Button}
		 */
		addRowButton: undefined,

		/**
		 * @property {CMDBuild.core.buttons.text.Confirm}
		 */
		confirmButton: undefined,

		/**
		 * @property {Object}
		 */
		content: undefined,

		/**
		 * @cfg {String}
		 */
		title: undefined,

		/**
		 * @cfg {Object}
		 */
		type: undefined,

		/**
		 * @property {Object}
		 */
		textareaConcatParameter: undefined,

		buttonAlign: 'center',
		constrain: true,
		height: 300,
		modal: true,
		overflowY: 'auto',
		resizable: false,
		width: 400,

		initComponent: function () {
			var contentItems = null;

			this.delegate = Ext.create('CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EditWindow', this);
			this.delegate.type = this.type;

			// Buttons configuration
				this.addRowButton = Ext.create('Ext.button.Button', {
					iconCls: 'add',
					text: CMDBuild.Translation.addFilter,
					scope: this,

					handler: function () {
						this.delegate.cmOn('onFilterWindowAdd');
					}
				});

				this.confirmButton = Ext.create('CMDBuild.core.buttons.text.Confirm', {
					text: CMDBuild.Translation.ok,
					scope: this,

					handler: function () {
						this.delegate.cmOn('onFilterWindowConfirm');
					}
				});

				this.abortButton = Ext.create('CMDBuild.core.buttons.text.Abort', {
					text: CMDBuild.Translation.cancel,
					scope: this,

					handler: function () {
						this.delegate.cmOn('onFilterWindowAbort');
					}
				});
			// END: Buttons configuration

			if (!Ext.isEmpty(this.content))
				contentItems = this.content.split(this.textareaConcatParameter);

			this.contentComponent = Ext.create('Ext.form.Panel', {
				layout: {
					anchor: '100%'
				},

				items: this.delegate.buildWindowItem(contentItems)
			});


			Ext.apply(this, {
				dockedItems: [
					{
						xtype: 'toolbar',
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,
						items: this.addRowButton
					}
				],
				items: [this.contentComponent],
				fbar: [this.confirmButton, this.abortButton]
			});

			this.callParent(arguments);
		}
	});

})();
