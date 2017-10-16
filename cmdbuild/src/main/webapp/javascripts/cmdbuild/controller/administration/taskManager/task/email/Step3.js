(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.email.Step3', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Email}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onCheckedAttachmentsFieldset'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.email.Step3}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.email.Email} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.email.Step3', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.notificationForm.CMNotificationFormController} delegate
			 */
			getNotificationDelegate: function () {
				return this.view.notificationForm.delegate;
			},

			/**
			 * @return {Boolean}
			 */
			getValueAttachmentsFieldsetCheckbox: function () {
				return this.view.attachmentsFieldset.checkboxCmp.getValue();
			},

			/**
			 * @return {Boolean}
			 */
			getValueNotificationFieldsetCheckbox: function () {
				return this.view.notificationFieldset.checkboxCmp.getValue();
			},

			/**
			 * @return {Boolean}
			 */
			getValueParsingFieldsetCheckbox: function () {
				return this.view.parsingFieldset.checkboxCmp.getValue();
			},

		/**
		 * Read CMDBuild's alfresco configuration from server and set Combobox store
		 */
		onCheckedAttachmentsFieldset: function () {
			if (
				!Ext.isEmpty(this.view.attachmentsCombo.getStore())
				&& this.view.attachmentsCombo.getStore().getCount() == 0
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
				params[CMDBuild.core.constants.Proxy.SHORT] = true;
				params[CMDBuild.core.constants.Proxy.TYPE] = CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY);

				this.view.attachmentsCombo.getStore().load({ params: params });
			}
		},

		// SETters functions
			/**
			 * Set attachments field as required/unrequired
			 *
			 * @param {Boolean} state
			 */
			setAllowBlankAttachmentsField: function (state) {
				this.view.attachmentsCombo.allowBlank = state;
			},

			/**
			 * Set parsing fields as required/unrequired
			 *
			 * @param {Boolean} state
			 */
			setAllowBlankParsingFields: function (state) {
				this.view.parsingKeyStart.allowBlank = state;
				this.view.parsingKeyEnd.allowBlank = state;
				this.view.parsingValueStart.allowBlank = state;
				this.view.parsingValueEnd.allowBlank = state;
				this.view.parsingFieldset.allowBlank = state;
			},

			/**
			 * @param {String} value
			 */
			setValueAttachmentsCombo: function (value) {
				this.view.attachmentsCombo.setValue(value);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueAttachmentsFieldsetCheckbox: function (state) {
				if (state) {
					this.view.attachmentsFieldset.expand();
					this.onCheckedAttachmentsFieldset();
				} else {
					this.view.attachmentsFieldset.collapse();
				}
			},

			/**
			 * @param {Boolean} state
			 */
			setValueNotificationFieldsetCheckbox: function (state) {
				if (state) {
					this.view.notificationFieldset.expand();
				} else {
					this.view.notificationFieldset.collapse();
				}
			},

			/**
			 * @param {String} value
			 */
			setValueNotificationTemplate: function (value) {
				this.getNotificationDelegate().setValue('template', value);
			},

			/**
			 * Setup all parsing fieldset input values
			 *
			 * @param {String} keyInit
			 * @param {String} keyEnd
			 * @param {String} valueInit
			 * @param {String} valueEnd
			 */
			setValueParsingFields: function (keyInit, keyEnd, valueInit, valueEnd) {
				this.view.parsingKeyStart.setValue(keyInit);
				this.view.parsingKeyEnd.setValue(keyEnd);
				this.view.parsingValueStart.setValue(valueInit);
				this.view.parsingValueEnd.setValue(valueEnd);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueParsingFieldsetCheckbox: function (state) {
				if (state) {
					this.view.parsingFieldset.expand();
				} else {
					this.view.parsingFieldset.collapse();
				}
			}
	});

})();
