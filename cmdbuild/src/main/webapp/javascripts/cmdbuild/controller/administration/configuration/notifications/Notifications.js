(function () {

	Ext.define('CMDBuild.controller.administration.configuration.notifications.Notifications', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.configuration.notifications.Notifications'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.Configuration}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'configurationNotificationsConfigurationGet',
			'configurationNotificationsConfigurationIsEmpty',
			'onConfigurationNotificationsSaveButtonClick',
			'onConfigurationNotificationsShow = onConfigurationNotificationsAbortButtonClick'
		],

		/**
		 * @property {CMDBuild.model.administration.configuration.notifications.Notifications}
		 *
		 * @private
		 */
		configuration: {},

		/**
		 * @property {CMDBuild.controller.administration.configuration.notifications.tabs.Email}
		 */
		controllerTabEmail: undefined,

		/**
		 * @property {CMDBuild.view.administration.configuration.notifications.NotificationsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.configuration.Configuration} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.configuration.notifications.NotificationsView', { delegate: this });

			// Controller build
			this.controllerTabEmail = Ext.create('CMDBuild.controller.administration.configuration.notifications.tabs.Email', { parentDelegate: this });

			// Inject tabs (sorted)
			this.view.add([
				this.controllerTabEmail.getView()
			]);
		},

		// Configuration property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			configurationNotificationsConfigurationGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'configuration';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			configurationNotificationsConfigurationIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'configuration';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			configurationNotificationsConfigurationSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.configuration.notifications.Notifications';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'configuration';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		onConfigurationNotificationsSaveButtonClick: function () {
			var tabEmailConfigurationObject = this.controllerTabEmail.cmfg('configurationNotificationsTabEmailDataGet');

			if (this.controllerTabEmail.cmfg('configurationNotificationsTabEmailIsValid')) {
				var configurationModel = Ext.create('CMDBuild.model.administration.configuration.notifications.Notifications', tabEmailConfigurationObject);

				CMDBuild.proxy.administration.configuration.notifications.Notifications.update({
					params: configurationModel.getParamsObject(),
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onConfigurationNotificationsShow');

						CMDBuild.core.Message.success();
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationNotificationsShow: function () {
			CMDBuild.proxy.administration.configuration.notifications.Notifications.read({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.configurationNotificationsConfigurationSet({ value: decodedResponse });

						// Manage tab selection
						if (Ext.isEmpty(this.view.getActiveTab()))
							this.view.setActiveTab(0);

						this.view.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected
					} else {
						_error('onConfigurationTabNotificationsShow(): unmanaged response', this, decodedResponse);
					}
				}
			});
		}
	});

})();
