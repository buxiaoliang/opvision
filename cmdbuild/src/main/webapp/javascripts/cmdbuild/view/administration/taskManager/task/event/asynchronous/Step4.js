(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.event.asynchronous.Step4', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step4}
		 */
		delegate: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			var me = this;

			// Email notification configuration
				this.notificationForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.notificationForm.NotificationFormView', {
					sender: {
						type: 'sender',
						disabled: false
					},
					template: {
						type: 'template',
						disabled: false
					}
				});

				this.notificationFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.sendNotificationEmail,
					checkboxName: CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',

					items: [this.notificationForm]
				});
			// END: Email notification configuration

			// Workflow configuration
				this.workflowForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.workflowForm.WorkflowFormView', {
					combo: {
						name: CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME
					}
				});

				this.workflowFieldset = Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.startProcess,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',

					items: [this.workflowForm]
				});
			// END: Workflow configuration

			Ext.apply(this, {
				items: [
					this.notificationFieldset
					// , // TODO: future implementation
					// this.workflowFieldset
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			/**
			 * Disable attribute table to correct malfunction that enables on class select
			 */
			activate: function (view, eOpts) {
				if (!this.delegate.checkWorkflowComboSelected())
					this.delegate.setDisabledWorkflowAttributesGrid(true);
			}
		}
	});

})();
