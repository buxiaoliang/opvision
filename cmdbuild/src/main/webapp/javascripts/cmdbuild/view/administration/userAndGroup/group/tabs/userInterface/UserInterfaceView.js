(function () {

	Ext.define('CMDBuild.view.administration.userAndGroup.group.tabs.userInterface.UserInterfaceView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.tabs.UserInterface}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.userInterface.FormPanel}
		 */
		form: undefined,

		bodyCls: 'cmdb-gray-panel-no-padding',
		border: false,
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.uiConfiguration,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.form = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.userInterface.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onUserAndGroupGroupTabUserInterfaceShow');
			}
		}
	});

})();
