(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.notificationForm.TemplateCombo', {
		extend: 'Ext.form.field.ComboBox',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.common.NotificationForm'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.NotificationForm}
		 */
		delegate: undefined,

		name: CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE,
		fieldLabel: CMDBuild.Translation.template,
		labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
		valueField: CMDBuild.core.constants.Proxy.NAME,
		displayField: CMDBuild.core.constants.Proxy.NAME,
		maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
		forceSelection: true,
		editable: false,
		anchor: '100%',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.administration.taskManager.task.common.NotificationForm.getStoreTemplate(),
				queryMode: 'local'
			});

			this.callParent(arguments);
		}
	});

})();
