(function () {

	Ext.define('CMDBuild.core.buttons.iconized.add.Widget', {
		extend: 'Ext.button.Split',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets or CMDBuild.controller.administration.workflow.tabs.widgets.Widget}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		delegateEventPrefix: 'onButtonWidget',

		iconCls: 'add',
		text: CMDBuild.Translation.addWidget,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				scope: this,
				handler: function (button, e) {
					this.showMenu();
				},
				menu: Ext.create('Ext.menu.Menu', {
					items: [
						{
							text: CMDBuild.Translation.createReport,
							scope: this,

							handler: function (button, e) {
								this.delegate.cmfg(this.delegateEventPrefix + 'AddButtonClick', '.OpenReport');
							}
						},
						{
							text: CMDBuild.Translation.calendar,
							scope: this,

							handler: function (button, e) {
								this.delegate.cmfg(this.delegateEventPrefix + 'AddButtonClick', '.Calendar');
							}
						},
						{
							text: CMDBuild.Translation.startWorkflow,
							scope: this,

							handler: function (button, e) {
								this.delegate.cmfg(this.delegateEventPrefix + 'AddButtonClick', '.Workflow');
							}
						},
						{
							text: CMDBuild.Translation.ping,
							scope: this,

							handler: function (button, e) {
								this.delegate.cmfg(this.delegateEventPrefix + 'AddButtonClick', '.Ping');
							}
						},
						{
							text: CMDBuild.Translation.createModifyCard,
							scope: this,

							handler: function (button, e) {
								this.delegate.cmfg(this.delegateEventPrefix + 'AddButtonClick', '.CreateModifyCard');
							}
						}
					]
				})
			});

			this.callParent(arguments);
		}
	});

})();
