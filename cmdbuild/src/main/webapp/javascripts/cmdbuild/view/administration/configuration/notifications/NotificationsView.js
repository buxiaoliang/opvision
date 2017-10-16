(function () {

	Ext.define('CMDBuild.view.administration.configuration.notifications.NotificationsView', {
		extend: 'Ext.tab.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.notifications.Notifications}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		frame: false,
		overflowY: 'auto',

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onConfigurationNotificationsShow');
			}
		}
	});

})();
