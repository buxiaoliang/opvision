(function () {

	Ext.define('CMDBuild.controller.common.field.trigger.cron.window.Edit', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.field.trigger.cron.Cron}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldTriggerCronWindowEditConfigurationGet',
			'onFieldTriggerCronWindowEditAbortButtonClick',
			'onFieldTriggerCronWindowEditBeforeShow',
			'onFieldTriggerCronWindowEditConfigure',
			'onFieldTriggerCronWindowEditFieldSetChecked',
			'onFieldTriggerCronWindowEditSaveButtonClick'
		],

		/**
		 * @property {CMDBuild.model.common.field.trigger.cron.window.EditConfiguration}
		 *
		 * @private
		 */
		configuration: {},

		/**
		 * @property {CMDBuild.view.common.field.trigger.cron.window.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.field.trigger.cron.window.EditWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {CMDBuild.view.common.field.trigger.cron.Cron} configObject.view
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.field.trigger.cron.window.EditWindow', { delegate: this });
		},

		/**
		 * @returns {String}
		 *
		 * @private
		 */
		buildValue: function () {
			var data = this.form.getData();

			// Error handling
				if (!Ext.isObject(data) || Ext.Object.isEmpty(data))
					return _error('buildValue(): unmanaged data value', this, data);

				if (!Ext.isString(data[CMDBuild.core.constants.Proxy.MODE]) || Ext.isEmpty(data[CMDBuild.core.constants.Proxy.MODE]))
					return _error('buildValue(): unmanaged mode property', this, data[CMDBuild.core.constants.Proxy.MODE]);
			// END: Error handling

			switch (data[CMDBuild.core.constants.Proxy.MODE]) {
				case 'each':
					return '*';

				case 'exactly':
					return data['exactly'];

				case 'range':
					return data['valueFrom'] + '-' + data['valueTo'];

				case 'step':
					return '0/' + data['valueStep'];

				default:
					return _error('buildValue(): unmanaged mode property', this, data[CMDBuild.core.constants.Proxy.MODE]);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		disableFieldSets: function () {
			if (Ext.isObject(this.form) && !Ext.Object.isEmpty(this.form)) {
				this.form.setDisabledFieldSet(this.form.fieldSetStep, true);
				this.form.setDisabledFieldSet(this.form.fieldSetRange, true);
				this.form.setDisabledFieldSet(this.form.fieldSetExact, true);
			} else {
				_error('disableFieldSets(): unmanaged form property', this, this.form);
			}
		},

		// Configuration property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			fieldTriggerCronWindowEditConfigurationGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'configuration';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			fieldTriggerCronWindowEditConfigurationReset: function (parameters) {
				this.propertyManageReset('configuration');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			fieldTriggerCronWindowEditConfigurationSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.field.trigger.cron.window.EditConfiguration';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'configuration';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		onFieldTriggerCronWindowEditAbortButtonClick: function () {
			this.fieldTriggerCronWindowEditConfigurationReset();

			this.view.close();
		},

		/**
		 * @returns {Boolean}
		 */
		onFieldTriggerCronWindowEditBeforeShow: function () {
			if (Ext.isObject(this.configuration) && !Ext.Object.isEmpty(this.configuration)) {
			    	CMDBuild.clearComponent(this.view);
				this.view.setTitle(this.cmfg('fieldTriggerCronWindowEditConfigurationGet', CMDBuild.core.constants.Proxy.TITLE));
				this.view.add(this.form = Ext.create('CMDBuild.view.common.field.trigger.cron.window.FormPanel', { delegate: this }));

				this.disableFieldSets();
			} else {
				_error('onFieldTriggerCronWindowEditBeforeShow(): unmanaged configuration parameter', this, this.configuration);
			}
		},

		/**
		 * @param {Object} configurationObject
		 * @param {String} configurationObject.title
		 *
		 * @returns {Void}
		 */
		onFieldTriggerCronWindowEditConfigure: function (configurationObject) {
			this.fieldTriggerCronWindowEditConfigurationReset();

			if (Ext.isObject(configurationObject) && !Ext.Object.isEmpty(configurationObject)) {
				if (!Ext.isString(configurationObject.title)  || Ext.isEmpty(configurationObject.title))
					return _error('onFieldTriggerCronWindowEditConfigure(): unmanaged title parameter', this, configurationObject.title);

				this.fieldTriggerCronWindowEditConfigurationSet({ value: configurationObject });

				this.view.show();
			} else {
				_error('onFieldTriggerCronWindowEditConfigure(): unmanaged configurationObject parameter', this, configurationObject);
			}
		},

		/**
		 * @param {String} mode
		 *
		 * @returns {Ext.data.Store}
		 */
		onFieldTriggerCronWindowEditFieldSetChecked: function (mode) {
			this.disableFieldSets();

			this.form.reset();

			switch (mode) {
				case 'exactly':
					return this.form.setDisabledFieldSet(this.form.fieldSetExact, false);

				case 'range':
					return this.form.setDisabledFieldSet(this.form.fieldSetRange, false);

				case 'step':
					return this.form.setDisabledFieldSet(this.form.fieldSetStep, false);
			}
		},

		/**
		 * @returns {Void}
		 */
		onFieldTriggerCronWindowEditSaveButtonClick: function () {
			this.cmfg('onFieldTriggerCronValuesSet', this.buildValue());
			this.cmfg('onFieldTriggerCronWindowEditAbortButtonClick');
		}
	});

})();
