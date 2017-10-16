(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EmailFilterFormView', {
		extend: 'Ext.form.FieldContainer',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EmailFilterForm}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditButton}
		 */
		button: undefined,

		/**
		 * @property {Object}
		 */
		buttonConfig: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.Textarea}
		 */
		textarea: undefined,

		/**
		 * @property {Object}
		 */
		textareaConfig: undefined,

		border: false,
		considerAsFieldToDisable: true,
		labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
		layout: 'hbox',
		width: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,

		/**
		 * To acquire informations to setup fields before creation
		 *
		 * @param {Object} configuration
		 * @param {Object} configuration.textarea
		 * @param {Object} configuration.button
		 */
		constructor: function (configuration) {
			this.delegate = Ext.create('CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EmailFilterForm', this);

			if (!Ext.isEmpty(configuration) || !Ext.isEmpty(configuration.fieldContainer)) {
				Ext.apply(this, configuration.fieldContainer);
			}

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.textarea)) {
				this.textareaConfig = { delegate: this.delegate };
			} else {
				this.textareaConfig = configuration.textarea;
				this.textareaConfig.delegate = this.delegate;
			}

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.button)) {
				this.buttonConfig = { delegate: this.delegate };
			} else {
				this.buttonConfig = configuration.button;
				this.buttonConfig.delegate = this.delegate;
			}

			this.callParent(arguments);
		},

		initComponent: function () {
			this.textarea = Ext.create('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.Textarea', this.textareaConfig);
			this.delegate.textareaField = this.textarea;

			this.button = Ext.create('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditButton', this.buttonConfig);
			this.delegate.buttonField = this.button;

			Ext.apply(this, {
				items: [this.textarea, this.button]
			});

			this.callParent(arguments);
		}
	});

})();
