(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.cronForm.CronFormView', {
		extend: 'Ext.container.Container',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.CronForm}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.cronForm.Advanced}
		 */
		advanced: undefined,

		/**
		 * @property {Object}
		 */
		advancedConfig: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.cronForm.Base}
		 */
		base: undefined,

		/**
		 * @property {Object}
		 */
		baseConfig: undefined,

		border: false,
		considerAsFieldToDisable: true,

		/**
		 * To acquire informations to setup fields before creation
		 *
		 * @param (Object) configuration
		 * @param (Object) configuration.advanced
		 * @param (Object) configuration.base
		 */
		constructor: function (configuration) {
			this.delegate = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronForm', this);

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.advanced)) {
				this.advancedConfig = { delegate: this.delegate };
			} else {
				this.advancedConfig = configuration.advanced;
				this.advancedConfig.delegate = this.delegate;
			}

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.base)) {
				this.baseConfig = { delegate: this.delegate };
			} else {
				this.baseConfig = configuration.base;
				this.baseConfig.delegate = this.delegate;
			}

			this.callParent(arguments);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			this.advanced = Ext.create('CMDBuild.view.administration.taskManager.task.common.cronForm.Advanced', this.advancedConfig);
			this.base = Ext.create('CMDBuild.view.administration.taskManager.task.common.cronForm.Base', this.baseConfig);

			this.delegate.advancedField = this.advanced;
			this.delegate.baseField = this.base;

			Ext.apply(this, {
				items: [this.base, this.advanced]
			});

			this.callParent(arguments);
		},

		listeners: {
			// To correctly enable radio fields on tab show
			show: function (view, eOpts) {
				if (this.delegate.isEmptyBase())
					this.delegate.setValueAdvancedRadio(true);

				if (this.delegate.isEmptyAdvanced())
					this.delegate.setValueBaseRadio(true);

				if (!this.delegate.isEmptyBase() && !this.delegate.isEmptyAdvanced())
					this.delegate.setValueBaseRadio(true);
			}
		}
	});

})();
