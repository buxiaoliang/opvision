(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.group.tabs.privileges.PrivilegesView', {
		extend: 'Ext.tab.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.permissions,

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onUserAndGroupGroupTabPrivilegesShow');
			}
		}
	});

})();
