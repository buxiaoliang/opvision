(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.event.Asynchronous'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.Event}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskAbortButtonClick',
			'onTaskManagerFormTaskCloneButtonClick',
			'onTaskManagerFormTaskEventAsynchronousAddButtonClick = onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskEventAsynchronousClassSelected',
			'onTaskManagerFormTaskEventAsynchronousModifyButtonClick = onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskEventAsynchronousRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskEventAsynchronousSaveButtonClick = onTaskManagerFormTaskSaveButtonClick',
			'onTaskManagerFormTaskRemoveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step2}
		 */
		controllerStep2: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		controllerStep3: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step4}
		 */
		controllerStep4: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.event.Event} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub controllers
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step2', { parentDelegate: this });
			this.controllerStep3 = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', { parentDelegate: this });
			this.controllerStep4 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step4', { parentDelegate: this });

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView(),
				this.controllerStep3.getView(),
				this.controllerStep4.getView()
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventAsynchronousAddButtonClick: function () {
			this.onTaskManagerFormTaskAddButtonClick(arguments); // CallParent alias

			if (this.controllerStep1.isEmptyClass())
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);

			this.controllerStep4.eraseWorkflowForm();
		},

		/**
		 * @param {String} className
		 *
		 * @returns {Void}
		 */
		onTaskManagerFormTaskEventAsynchronousClassSelected: function (className) {
			this.cmfg('taskManagerFormNavigationSetDisableNextButton', false);

			this.controllerStep2.className = className;
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventAsynchronousModifyButtonClick: function () {
			this.onTaskManagerFormTaskModifyButtonClick(arguments); // CallParent alias

			if (this.controllerStep1.isEmptyClass())
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventAsynchronousRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.event.Asynchronous.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.event.asynchronous.Asynchronous', decodedResponse);

							// FIXME: loadRecord() fails with comboboxes, and i can't find good fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueClassName(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));

							// Setup step 2
							this.controllerStep2.setValueFilters(
								Ext.decode(record.get(CMDBuild.core.constants.Proxy.FILTER))
							);

							// Setup step 3
							this.controllerStep3.setValueAdvancedFields(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));
							this.controllerStep3.setValueBase(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));

							// Setup step 4
							this.controllerStep4.setValueNotificationFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE));
							this.controllerStep4.setValueNotificationAccount(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT));
							this.controllerStep4.setValueNotificationTemplate(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE));
							// TODO: future implementation
							// this.controllerStep4.setValueWorkflowAttributesGrid(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES));
							// this.controllerStep4.setValueWorkflowCombo(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME));
							// this.controllerStep4.setValueWorkflowFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE));

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
		onTaskManagerFormTaskEventAsynchronousSaveButtonClick: function () {
			var filterData = this.controllerStep2.getDataFilters();
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				submitDatas[CMDBuild.core.constants.Proxy.CRON_EXPRESSION] = this.controllerStep3.getCronDelegate().getValue();

				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var notificationFieldsetCheckboxValue = this.controllerStep4.getValueNotificationFieldsetCheckbox();
					if (notificationFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE] = notificationFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT];
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE];
					}
					// TODO: future implementation
					// var workflowFieldsetCheckboxValue = this.controllerStep4.getValueWorkflowFieldsetCheckbox();
					// if (workflowFieldsetCheckboxValue) {
					// 	var attributesGridValues = this.controllerStep4.getValueWorkflowAttributeGrid();
					//
					// 	if (!Ext.Object.isEmpty(attributesGridValues))
					// 		submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES] = Ext.encode(attributesGridValues);
					//
					// 	submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE] = workflowFieldsetCheckboxValue;
					// 	submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME];
					// }

				// Form submit values formatting
				if (!Ext.isEmpty(filterData))
					submitDatas[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(filterData);

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.CLASS_NAME];
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.event.Asynchronous.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.event.Asynchronous.update({
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

				CMDBuild.proxy.administration.taskManager.task.event.Asynchronous.remove({
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
			// Cron field validation
			this.controllerStep3.getCronDelegate().validate(enable);

			// Notification validation
			this.controllerStep4.getNotificationDelegate().validate(
				this.controllerStep4.getValueNotificationFieldsetCheckbox()
				&& enable
			);

			// TODO: future implementation
			// // Workflow form validation
			// this.controllerStep4.getWorkflowDelegate().validate(
			// 	this.controllerStep4.getValueWorkflowFieldsetCheckbox()
			// 	&& enable
			// );

			return this.callParent(arguments);
		}
	});

})();
