(function () {

	// External implementation to avoid overrides
	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * Class to be extended in widget controllers to adapt CMDBuild.controller.common.abstract.Base functionalities
	 *
	 * @requires Mandatory managed methods:
	 * 	- beforeActiveView
	 * 	- beforeHideView
	 * 	- getData
	 * 	- isValid
	 * 	- onBeforeSave
	 * 	- onEditMode
	 *
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.abstract.Widget', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Ext.data.Model or CMDBuild.model.CMActivityInstance}
		 */
		card: undefined,

		/**
		 * @cfg {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Boolean}
		 */
		enableDelegateApply: true,

		/**
		 * @cfg {Boolean}
		 */
		enableWidgetConfigurationSetup: true,

		/**
		 * Multiple widget instances data storage buffer
		 *
		 * @property {Object}
		 *
		 * @private
		 */
		instancesDataStorage: {},

		/**
		 * @property {CMDBuild.Management.TemplateResolver}
		 */
		templateResolver: undefined,

		/**
		 * @cfg {Object} // FIXME: future implementation (controllers will generate their own view)
		 */
		view: undefined,

		/**
		 * Plain widget configuration object
		 *
		 * @property {Object}
		 */
		widgetConfiguration: undefined,

		/**
		 * Widget configuration model built with WidgetConfiguration methods
		 *
		 * @property {Object}
		 *
		 * @private
		 */
		widgetConfigurationModel: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: undefined,

		statics: {
			/**
			 * Old implementation to be used in new widgets
			 *
			 * @param {Object} model
			 *
			 * @returns {Object} out
			 */
			getTemplateResolverServerVars: function (model) {
				var out = {};
				var pi = null;

				if (!Ext.isEmpty(model)) {
					if (Ext.getClassName(model) == 'CMDBuild.model.CMActivityInstance') {
						// Retrieve the process instance because it stores the data. this.card has only the varibles to show in this step (is the activity instance)
						pi = _CMWFState.getProcessInstance();
					} else if (Ext.getClassName(model) == 'CMDBuild.model.CMProcessInstance') {
						pi = model;
					}

					if (!Ext.isEmpty(pi) && Ext.isFunction(pi.getValues)) { // The processes use a new serialization. Add backward compatibility attributes to the card values
						out = Ext.apply({
							'Id': pi.get('Id'),
							'IdClass': pi.get('IdClass'),
							'IdClass_value': pi.get('IdClass_value')
						}, pi.getValues());
					} else {
						out = model.raw || model.data;
					}
				}

				return out;
			}
		},

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.common.CMWidgetManagerController} configurationObject.parentDelegate
		 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} configurationObject.card
		 * @param {Ext.form.Basic} configurationObject.clientForm
		 * @param {Object} configurationObject.view
		 * @param {Object} configurationObject.widgetConfiguration
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			// Error handling
				if (!Ext.isObject(configurationObject) || Ext.Object.isEmpty(configurationObject))
					return _error('constructor(): unmanaged configurationObject parameter', this, configurationObject);

				if (!Ext.isObject(configurationObject.view) || Ext.Object.isEmpty(configurationObject.view))
					return _error('constructor(): unmanaged view parameter', this, configurationObject.view);

				if (!Ext.isObject(configurationObject.widgetConfiguration) || Ext.Object.isEmpty(configurationObject.widgetConfiguration))
					return _error('constructor(): unmanaged configuration parameter', this, configurationObject.widgetConfiguration);
			// END: Error handling

			// Add default managed functions
			this.cmfgCatchedFunctions = Ext.Array.merge(this.cmfgCatchedFunctions, [
				'getLabel',
				'widgetConfigurationGet'
			]);

			this.callParent(arguments);

			// Setup widget configuration
			if (this.enableWidgetConfigurationSetup)
				this.widgetConfigurationSet({ value: this.widgetConfiguration });

			// Inject delegate to view
			if (this.enableDelegateApply)
				this.view.delegate = this;
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 */
		beforeActiveView: function () {
			// Setup widgetConfiguration on widget view activation to switch configuration on multiple instances
			if (!Ext.isEmpty(this.widgetConfiguration))
				this.widgetConfigurationSet({ value: this.widgetConfiguration });
		},

		/**
		 * Executed before window hide perform
		 *
		 * @returns {Void}
		 *
		 * @abstract
		 */
		beforeHideView: Ext.emptyFn,

		/**
		 * @returns {Object or null}
		 *
		 * @abstract
		 */
		getData: function () {
			return null;
		},

		/**
		 * @param {String} mode
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		getId: function (mode) {
			switch (mode) {
				// Generates a unique ID for widget related to card data, mode mainly used in InstancesDataStorage methods
				case 'unique': {
					if (!Ext.isEmpty(this.card.data[CMDBuild.core.constants.Proxy.ID]))
						return this.card.data[CMDBuild.core.constants.Proxy.ID] + '-' + this.widgetConfigurationGet(CMDBuild.core.constants.Proxy.ID);

					return this.widgetConfigurationGet(CMDBuild.core.constants.Proxy.ID);
				}

				// Original widget ID generated from server
				case 'strict':
				default:
					return this.widgetConfigurationGet(CMDBuild.core.constants.Proxy.ID);
			}
		},

		/**
		 * @returns {String}
		 */
		getLabel: function () {
			return this.widgetConfigurationGet(CMDBuild.core.constants.Proxy.LABEL);
		},

		/**
		 * @returns {Object}
		 */
		getTemplateResolverServerVars: function () {
			if (!Ext.isEmpty(this.card))
				return this.statics().getTemplateResolverServerVars(this.card);

			return {};
		},

		// InstancesDataStorage methods (multiple widget instances support)
			/**
			 * @returns {Boolean}
			 */
			instancesDataStorageExists: function () {
				if (!Ext.isEmpty(this.getId('unique')))
					return this.instancesDataStorage.hasOwnProperty(this.getId('unique'));

				return false;
			},

			/**
			 * @returns {Object or null}
			 */
			instancesDataStorageGet: function () {
				if (!Ext.isEmpty(this.getId('unique')) && !Ext.isEmpty(this.instancesDataStorage[this.getId('unique')]))
					return this.instancesDataStorage[this.getId('unique')];

				return null;
			},

			/**
			 * @returns {Boolean}
			 */
			instancesDataStorageIsEmpty: function () {
				if (!Ext.isEmpty(this.getId('unique')))
					return Ext.isEmpty(this.instancesDataStorage[this.getId('unique')]);

				return true;
			},

			/**
			 * @param {String} mode ['full' || 'single']
			 *
			 * @returns {Void}
			 */
			instancesDataStorageReset: function (mode) {
				mode = Ext.isString(mode) ? mode : 'full';

				switch (mode) {
					case 'single':
						return this.instancesDataStorage[this.getId('unique')] = null;

					case 'full':
					default:
						return this.instancesDataStorage = {};
				}
			},

			/**
			 * @param {Object} instanceData
			 *
			 * @returns {Void}
			 */
			instancesDataStorageSet: function (instanceData) {
				if (!Ext.isEmpty(this.getId('unique')))
					this.instancesDataStorage[this.getId('unique')] = instanceData;
			},

		/**
		 * @returns {Boolean}
		 *
		 * @abstract
		 */
		isValid: function () {
			return true;
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		onBeforeSave: function (parameters) {
			// Error handling
				if (!Ext.isObject(parameters) || Ext.Object.isEmpty(parameters))
					return _error('onBeforeSave(): unmanaged parameters object', this, parameters);

				if (!Ext.isFunction(parameters.callback))
					return _error('onBeforeSave(): unmanaged callback parameter', this, parameters.callback);
			// END: Error handling

			Ext.callback(
				parameters.callback,
				Ext.isEmpty(parameters.scope) ? this : parameters.scope
			);
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 */
		onEditMode: Ext.emptyFn,

		// WidgetConfiguration methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Object or null}
			 */
			widgetConfigurationGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'widgetConfigurationModel';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			widgetConfigurationIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'widgetConfigurationModel';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 * @param {String} parameters.modelName
			 * @param {Object} parameters.value
			 * @param {String} parameters.propertyName
			 *
			 * @returns {Object or null}
			 *
			 * @abstract
			 */
			widgetConfigurationSet: function (parameters) {
				// Error handling
					if (!Ext.isString(this.widgetConfigurationModelClassName) || Ext.isEmpty(this.widgetConfigurationModelClassName))
						return _error('widgetConfigurationSet(): unmanaged widgetConfigurationModelClassName configuration property', this, this.widgetConfigurationModelClassName);
				// END: Error handling

				parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = this.widgetConfigurationModelClassName;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'widgetConfigurationModel';
				parameters[CMDBuild.core.constants.Proxy.VALUE] = Ext.clone(parameters[CMDBuild.core.constants.Proxy.VALUE]);

				return this.propertyManageSet(parameters);
			},

		// WidgetController methods
			/**
			 * @param {String} propertyName
			 *
			 * @returns {Object or null}
			 */
			widgetControllerPropertyGet: function (propertyName) {
				if (!Ext.isEmpty(this[propertyName]))
					return this[propertyName];

				return null;
			}
	});

})();
