(function () {

	Ext.define('CMDBuild.view.administration.taskManager.TaskManagerView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.TaskManager}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.taskManager,

		bodyCls: 'cmdb-gray-panel-no-padding',
		border: true,
		frame: false,
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

						items: []
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
