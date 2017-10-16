(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.group.tabs.users.AvailableGridPanel', {
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
		title: CMDBuild.Translation.availableUsers,

		viewConfig: {
			loadMask: true,
			stripeRows: true,

			plugins: {
				ptype: 'gridviewdragdrop',
				dragGroup: 'availableGridDDGroup',
				dropGroup: 'selectedGridDDGroup'
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
				store: CMDBuild.proxy.administration.userAndGroup.group.tabs.Users.getStoreAvailable({ delegate: this.delegate })
			});

			this.callParent(arguments);
		}
	});

})();
