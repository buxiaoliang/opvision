(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.group.tabs.users.SelectedGridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.Users'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.tabs.Users}
		 */
		delegate: undefined,

		border: true,
		flex: 1,
		forceFit: true,
		frame: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it
		title: CMDBuild.Translation.selectedUsers,

		viewConfig: {
			loadMask: true,
			stripeRows: true,

			plugins: {
				ptype: 'gridviewdragdrop',
				dragGroup: 'selectedGridDDGroup',
				dropGroup: 'availableGridDDGroup'
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						text: CMDBuild.Translation.username,
						dataIndex: CMDBuild.core.constants.Proxy.NAME
					},
					{
						text: CMDBuild.Translation.descriptionLabel,
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION
					}
				],
				store: CMDBuild.proxy.administration.userAndGroup.group.tabs.Users.getStoreSelected()
			});

			this.callParent(arguments);
		}
	});

})();
