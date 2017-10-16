(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Connector', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.taskManager.task.Connector'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onClassSelected',
			'onTaskManagerFormTaskAbortButtonClick',
			'onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskCloneButtonClick',
			'onTaskManagerFormTaskConnectorRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskConnectorSaveButtonClick = onTaskManagerFormTaskSaveButtonClick',
			'onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskRemoveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.connector.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		controllerStep2: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.connector.Step3}
		 */
		controllerStep3: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.connector.Step4}
		 */
		controllerStep4: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.connector.Step5}
		 */
		controllerStep5: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub controllers
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.connector.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', { parentDelegate: this });
			this.controllerStep3 = Ext.create('CMDBuild.controller.administration.taskManager.task.connector.Step3', { parentDelegate: this });
			this.controllerStep4 = Ext.create('CMDBuild.controller.administration.taskManager.task.connector.Step4', { parentDelegate: this });
			this.controllerStep5 = Ext.create('CMDBuild.controller.administration.taskManager.task.connector.Step5', { parentDelegate: this });
			// this.controllerStep6 = Ext.create('CMDBuild.controller.administration.taskManager.task.connector.Step6', { parentDelegate: this }); // TODO: future implementation

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView(),
				this.controllerStep3.getView(),
				this.controllerStep4.getView(),
				this.controllerStep5.getView()
				// , // TODO: future implementation
				// this.controllerStep6.getView()
			]);
		},

		/**
		 * Filter class store to delete unselected classes
		 *
		 * @returns {Object} store
		 *
		 * TODO: refactor move to proxy
		 */
		getStoreFilteredClass: function () {
			var selectedClassArray = this.controllerStep4.getSelectedClassArray();
			var store = Ext.create('Ext.data.Store', {
				autoLoad: true,
				fields: [CMDBuild.core.constants.Proxy.NAME],
				data: []
			});

			for (var item in selectedClassArray) {
				var bufferObj = {};

				bufferObj[CMDBuild.core.constants.Proxy.NAME] = selectedClassArray[item];

				store.add(bufferObj);
			}

			return store;
		},

		/**
		 * Filter source store to delete unselected views
		 *
		 * @returns {Object} store
		 *
		 * TODO: refactor move to proxy
		 */
		getStoreFilteredSource: function () {
			var selectedSourceArray = this.controllerStep4.getSelectedSourceArray();
			var store = Ext.create('Ext.data.Store', {
				autoLoad: true,
				fields: [CMDBuild.core.constants.Proxy.NAME],
				data: []
			});

			for (var item in selectedSourceArray) {
				var bufferObj = {};

				bufferObj[CMDBuild.core.constants.Proxy.NAME] = selectedSourceArray[item];

				store.add(bufferObj);
			}

			return store;
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskConnectorRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Connector.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.connector.Connector', decodedResponse);

							// FIXME: loadRecord() fails with comboboxes, and i can't find a working fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));
							this.controllerStep1.setValueNotificationAccount(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT));
							this.controllerStep1.setValueNotificationFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE));
							this.controllerStep1.setValueNotificationTemplate(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE_ERROR));

							// Setup step 2
							this.controllerStep2.setValueAdvancedFields(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));
							this.controllerStep2.setValueBase(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));

							// Setup step 3
							this.controllerStep3.setValueDataSourceConfiguration(
								record.get(CMDBuild.core.constants.Proxy.DATASOURCE_TYPE),
								record.get(CMDBuild.core.constants.Proxy.DATASOURCE_CONFIGURATION)
							);

							// Setup step 4
							this.controllerStep4.setData(record.get(CMDBuild.core.constants.Proxy.CLASS_MAPPING));

							// Setup step 5
							this.controllerStep5.setData(record.get(CMDBuild.core.constants.Proxy.ATTRIBUTE_MAPPING));

							// Setup step 6
							// TODO: future implementation

							this.cmfg('taskManagerFormPanelForwarder', {
								functionName: 'disableModify',
								params: true
							});

							this.onTaskManagerFormTaskRowSelected(arguments); // CallParent alias
						}
					}
				});

				this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskConnectorSaveButtonClick: function () {
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var notificationFieldsetCheckboxValue = this.controllerStep1.getValueNotificationFieldsetCheckbox();
					if (notificationFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE] = notificationFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT];
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE_ERROR] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE_ERROR];
					}

				submitDatas[CMDBuild.core.constants.Proxy.CRON_EXPRESSION] = this.controllerStep2.getCronDelegate().getValue();

				// Form submit values formatting
					var dataSourceType = this.controllerStep3.getTypeDataSource();
					if (dataSourceType) {
						var configurationObject = {};

						switch (dataSourceType) {
							case 'db': {
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_ADDRESS] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_ADDRESS];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_NAME] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_NAME];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PASSWORD] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PASSWORD];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PORT] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_PORT];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_TYPE] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_TYPE];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_USERNAME] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_USERNAME];
								configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_TABLE_VIEW_PREFIX] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_TABLE_VIEW_PREFIX];

								if (!Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_INSATANCE_NAME]))
									configurationObject[CMDBuild.core.constants.Proxy.DATASOURCE_DB_INSATANCE_NAME] = formData[CMDBuild.core.constants.Proxy.DATASOURCE_DB_INSATANCE_NAME];
							} break;

							default:
								_error('onTaskManagerFormTaskConnectorSaveButtonClick(): datasource type not recognized', this, dataSourceType);
						}

						submitDatas[CMDBuild.core.constants.Proxy.DATASOURCE_TYPE] = dataSourceType;
						submitDatas[CMDBuild.core.constants.Proxy.DATASOURCE_CONFIGURATION] = Ext.encode(configurationObject);
					}

					var classMappingData = this.controllerStep4.getData();
					if (!Ext.isEmpty(classMappingData))
						submitDatas[CMDBuild.core.constants.Proxy.CLASS_MAPPING] = Ext.encode(classMappingData);

					var attributeMappingData = this.controllerStep5.getData();
					if (!Ext.isEmpty(attributeMappingData))
						submitDatas[CMDBuild.core.constants.Proxy.ATTRIBUTE_MAPPING] = Ext.encode(attributeMappingData);

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.Connector.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.Connector.update({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				}
			}

			this.onTaskManagerFormTaskSaveButtonClick(arguments); // CallParent alias
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 * @private
		 */
		removeItem: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Connector.remove({
					params: params,
					scope: this,
					success: this.success
				});
			} else {
				_error('removeItem(): cannot remove empty selected grid task', this, this.cmfg('taskManagerSelectedTaskGet'));
			}

			this.callParent(arguments);
		},

		/**
		 * Task validation
		 *
		 * @param {Boolean} enable
		 *
		 * @returns {Boolean}
		 *
		 * @override
		 */
		validate: function (enable) {
			// Notification validation
			this.controllerStep1.getNotificationDelegate().validate(
				this.controllerStep1.getValueNotificationFieldsetCheckbox()
				&& enable
			);

			// Cron field validation
			this.controllerStep2.getCronDelegate().validate(enable);

			// DataSource configuration validation
			this.controllerStep3.validate(enable);

			// Class-mapping validation
			if (Ext.isEmpty(this.controllerStep4.getData()) && enable) {
				CMDBuild.core.Message.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.classLevelMappingTableMustBeCorrectlyFilled, false);

				this.controllerStep4.markInvalidTable("x-grid-invalid");

				return false;
			} else {
				this.controllerStep4.markValidTable("x-grid-invalid");
			}

			// Attribute-mapping validation
			if (Ext.isEmpty(this.controllerStep5.getData()) && enable) {
				CMDBuild.core.Message.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.attributeLevelMappingTableMustBeCorrectlyFilledg, false);

				this.controllerStep5.markInvalidTable("x-grid-invalid");

				return false;
			} else {
				this.controllerStep5.markValidTable("x-grid-invalid");
			}

			// Reference-mapping validation
			// TODO: future implementation
			// if (Ext.isEmpty(this.delegateStep[5].getData()) && enable) {
			//		CMDBuild.core.Message.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.referenceLevelMappingTableMustBeCorrectlyFilled, false);
			//
			//		return false;
			// }

			return this.callParent(arguments);
		},

		/**
		 * Function to validate single step grids deleting invalid fields
		 *
		 * @param {Object} gridStore
		 *
		 * @returns {Void}
		 *
		 * TODO: refactor move to step delegates
		 */
		validateStepGrid: function (gridStore) {
			if (gridStore.count() > 0) {
				gridStore.each(function (record, id) {
					if (
						!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME))
						&& !Ext.Array.contains(this.controllerStep4.getSelectedClassArray(), record.get(CMDBuild.core.constants.Proxy.CLASS_NAME))
					)
						record.set(CMDBuild.core.constants.Proxy.CLASS_NAME, '');

					if (
						!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME))
						&& !Ext.Array.contains(this.controllerStep4.getSelectedSourceArray(), record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME))
					)
						record.set(CMDBuild.core.constants.Proxy.SOURCE_NAME, '');
				}, this);
			}
		}
	});

})();
