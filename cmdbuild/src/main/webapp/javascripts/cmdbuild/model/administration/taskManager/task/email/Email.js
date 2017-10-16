(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.taskManager.task.email.Email', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ATTACHMENTS_ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ATTACHMENTS_CATEGORY, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CRON_EXPRESSION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER_FROM_ADDRESS, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.FILTER_FUNCTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILTER_SUBJECT, type: 'auto' },
			{ name: CMDBuild.core.constants.Proxy.FILTER_TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.INCOMING_FOLDER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARSING_ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.PARSING_KEY_END, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARSING_KEY_INIT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARSING_VALUE_END, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARSING_VALUE_INIT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PROCESSED_FOLDER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.REJECT_NOT_MATCHING, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.REJECTED_FOLDER, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME, type: 'string' }
		]
	});

})();
