(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.user.UserView', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.GridAndFormView',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.User}
		 */
		delegate: undefined,

		/**
		 * @cfg {Boolean}
		 */
		enableTools: false,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {Ext.form.field.Checkbox}
		 */
		includeDisabledUsers: undefined,

		baseTitle: CMDBuild.Translation.users,
		bodyCls: 'cmdb-gray-panel-no-padding',
		border: false,
		layout: 'border',

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
							Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addUser,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onUserAndGroupUserAddButtonClick');
								}
							}),
							'->',
							this.includeDisabledUsers = Ext.create('Ext.form.field.Checkbox', {
								boxLabel: CMDBuild.Translation.enabledOnly,
								boxLabelCls: 'cmdb-toolbar-item',
								inputValue: true,
								uncheckedValue: false,
								checked: false, // Default as false
								scope: this,

								handler: function (checkbox, checked) {
									this.delegate.cmfg('onUserAndGroupUserShow');
								}
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.userAndGroup.user.GridPanel', { delegate: this.delegate }),
					this.form = Ext.create('CMDBuild.view.administration.userAndGroup.user.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onUserAndGroupUserShow');
			}
		}
	});

})();
