(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.generic.Step4', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Step4}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView}
		 */
		emailForm: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.emailForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView', {
						sender: {
							type: 'sender',
							name: CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT,
							disabled: false
						},
						template: {
							type: 'template',
							name: CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE,
							disabled: false
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
