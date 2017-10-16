(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.user.GridPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.grid.GridPanel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.user.User'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.User}
		 */
		delegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.NAME,
						text: CMDBuild.Translation.username
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel
					},
					Ext.create('Ext.ux.grid.column.Active', {
						dataIndex: CMDBuild.core.constants.Proxy.ACTIVE,
						text: CMDBuild.Translation.enabled,
						maxWidth: 60,
						align: 'center',
						hideable: false,
						menuDisabled: true,
						fixed: true
					})
				],
				store: CMDBuild.proxy.administration.userAndGroup.user.User.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			itemdblclick: function (panel, record, item, index, e, eOpts) {
				this.delegate.cmfg('onUserAndGroupUserItemDoubleClick');
			},
			select: function (row, record, index) {
				this.delegate.cmfg('onUserAndGroupUserRowSelected');
			}
		}
	});

})();
