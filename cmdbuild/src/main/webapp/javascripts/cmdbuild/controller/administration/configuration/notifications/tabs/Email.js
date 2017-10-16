(function () {

	Ext.define('CMDBuild.controller.administration.configuration.notifications.tabs.Email', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.configuration.notifications.tabs.Email'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.notifications.Notifications}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'configurationNotificationsTabEmailDataGet',
			'configurationNotificationsTabEmailIsValid',
			'onConfigurationNotificationsTabEmailShow',
			'onConfigurationNotificationsTabEmailTemplateSelect'
		],

		/**
		 * @property {CMDBuild.view.administration.configuration.notifications.tabs.EmailPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.configuration.notifications.Notifications} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.configuration.notifications.tabs.EmailPanel', { delegate: this });

			this.setupFieldsDefault();
		},

		/**
		 * @returns {Object}
		 */
		configurationNotificationsTabEmailDataGet: function () {
			return this.view.panelFunctionDataGet({ includeDisabled: true });
		},

		/**
		 * @returns {Boolean}
		 */
		configurationNotificationsTabEmailIsValid: function () {
			var fieldEnabledValue = this.view.panelFunctionValueGet({ propertyName: CMDBuild.core.constants.Proxy.ENABLED });

			if (fieldEnabledValue) {
				this.view.fieldTemplate.allowBlank = !fieldEnabledValue;

				this.readTemplate({
					name: this.view.panelFunctionValueGet({ propertyName: CMDBuild.core.constants.Proxy.TEMPLATE }),
					scope: this,
					callback: function (decodedResponse) {
						// If template has defaultAccount setup account combobox mandatory
						this.view.fieldAccount.allowBlank = (
							Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.DEFAULT_ACCOUNT])
							&& !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.DEFAULT_ACCOUNT])
						);

						// Setup destination field mandatory if not present to, cc, bcc template's attributes
						this.view.fieldDestination.allowBlank = (
							Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.TO]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.TO])
							|| Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.CC]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.CC])
							|| Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.BCC]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.BCC])
						);
					}
				});

				return this.validate(this.view);
			}

			return true;
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationNotificationsTabEmailShow: function () {
			// Error handling
				if (this.cmfg('configurationNotificationsConfigurationIsEmpty'))
					return _error('onConfigurationNotificationsTabEmailShow(): empty configuration model', this, this.cmfg('configurationNotificationsConfigurationGet'));
			// END: Error handling

			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'configurationNotificationsTabEmailBarrier',
				scope: this,
				callback: function () {
					this.view.reset();
					this.view.loadRecord(this.cmfg('configurationNotificationsConfigurationGet'));

					this.setupFieldsStatus();
				}
			});

			this.view.fieldAccount.getStore().load({ callback: requestBarrier.getCallback('configurationNotificationsTabEmailBarrier') });
			this.view.fieldTemplate.getStore().load({ callback: requestBarrier.getCallback('configurationNotificationsTabEmailBarrier') });

			requestBarrier.finalize('configurationNotificationsTabEmailBarrier', true);
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationNotificationsTabEmailTemplateSelect: function () {
			this.view.fieldAccount.reset();
			this.view.fieldDestination.reset();

			this.setupFieldsStatus();
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.callback
		 * @param {String} parameters.name
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readTemplate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (!Ext.isString(parameters.name) || Ext.isEmpty(parameters.name))
					return _error('readTemplate(): unmanaged name parameter', this, parameters.name);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.NAME] = parameters.name;

			CMDBuild.proxy.administration.configuration.notifications.tabs.Email.readTemplate({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						Ext.callback(parameters.callback, parameters.scope, [decodedResponse]);
					} else {
						_error('readTemplate(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		setupFieldsAccount: function (state) {
			state = Ext.isBoolean(state) ? state : true;

			this.view.fieldAccount.setDisabled(state);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		setupFieldsDefault: function () {
			this.setupFieldsAccount();
			this.setupFieldsDestination();
		},

		/**
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		setupFieldsDestination: function (state) {
			state = Ext.isBoolean(state) ? state : true;

			this.view.fieldDestination.setDisabled(state);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		setupFieldsStatus: function () {
			var name = this.view.panelFunctionValueGet({ propertyName: CMDBuild.core.constants.Proxy.TEMPLATE });

			if (Ext.isString(name) && !Ext.isEmpty(name)) {
				this.readTemplate({
					name: name,
					scope: this,
					callback: function (decodedResponse) {
						// If template has defaultAccount disable account combobox
						this.setupFieldsAccount(
							Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.DEFAULT_ACCOUNT])
							&& !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.DEFAULT_ACCOUNT])
						);

						// Setup destination field with to, cc, bcc template's attributes
						this.setupFieldsDestination(
							Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.TO]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.TO])
							|| Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.CC]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.CC])
							|| Ext.isString(decodedResponse[CMDBuild.core.constants.Proxy.BCC]) && !Ext.isEmpty(decodedResponse[CMDBuild.core.constants.Proxy.BCC])
						);
					}
				});
			} else {
				this.setupFieldsDefault();
			}
		}
	});

})();
