(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.event.synchronous.Step2', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.synchronous.Step2}
		 */
		delegate: undefined,

		border: false,
		frame: true,
		layout: 'fit',
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			this.filterTabPanel = Ext.create('Ext.tab.Panel', {
				border: false
			});

			Ext.apply(this, {
				items: [this.filterTabPanel]
			});

			this.callParent(arguments);
		},

		listeners: {
			// Draw tabs on activate
			activate: function (panel, eOpts) {
				this.delegate.drawFilterTabs();
			}
		}
	});

})();
