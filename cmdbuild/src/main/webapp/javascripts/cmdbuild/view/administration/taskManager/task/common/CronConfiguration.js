(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.CronConfiguration', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.cronForm.CronFormView}
		 */
		cronForm: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.cronForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.cronForm.CronFormView')
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			// To correctly enable radio fields on item activate
			activate: function (view, eOpts) {
				this.cronForm.fireEvent('show', view, eOpts);
			}
		}
	});

})();
