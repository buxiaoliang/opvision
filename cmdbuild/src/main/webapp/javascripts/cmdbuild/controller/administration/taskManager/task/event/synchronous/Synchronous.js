(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.synchronous.Synchronous', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.event.Synchronous'
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
			'onTaskManagerFormTaskRemoveButtonClick',
			'onTaskManagerFormTaskEventSynchronousAddButtonClick = onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskEventSynchronousClassSelected',
			'onTaskManagerFormTaskEventSynchronousModifyButtonClick = onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskEventSynchronousRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskEventSynchronousSaveButtonClick = onTaskManagerFormTaskSaveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.synchronous.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.synchronous.Step2}
		 */
		controllerStep2: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.event.synchronous.Step3}
		 */
		controllerStep3: undefined,

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
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.synchronous.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.synchronous.Step2', { parentDelegate: this });
			this.controllerStep3 = Ext.create('CMDBuild.controller.administration.taskManager.task.event.synchronous.Step3', { parentDelegate: this });

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView(),
				this.controllerStep3.getView()
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventSynchronousAddButtonClick: function () {
			this.onTaskManagerFormTaskAddButtonClick(arguments); // CallParent alias

			if (this.controllerStep1.isEmptyClass())
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);

			// Select all groups by default only if there aren't other selections
			if (Ext.isEmpty(this.controllerStep1.view.groups.getValue()) || this.controllerStep1.view.groups.getValue().length == 0)
				this.controllerStep1.view.groups.selectAll();

			this.controllerStep3.eraseWorkflowForm();
		},

		/**
		 * @param {String} className
		 *
		 * @returns {Void}
		 */
		onTaskManagerFormTaskEventSynchronousClassSelected: function (className) {
			this.cmfg('taskManagerFormNavigationSetDisableNextButton', false);

			this.controllerStep2.className = className;
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventSynchronousModifyButtonClick: function () {
			this.onTaskManagerFormTaskModifyButtonClick(arguments); // CallParent alias

			if (this.controllerStep1.isEmptyClass())
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEventSynchronousRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.event.Synchronous.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.event.synchronous.Synchronous', decodedResponse);

							// FIXME: loadRecord() fails with comboboxes, and i can't find good fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.selectGroups(record.get(CMDBuild.core.constants.Proxy.GROUPS));
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueClassName(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));
							this.controllerStep1.setValuePhase(record.get(CMDBuild.core.constants.Proxy.PHASE));

							// Setup step 2
							this.controllerStep2.setValueFilters(
								Ext.decode(record.get(CMDBuild.core.constants.Proxy.FILTER))
							);

							// Setup step 3
							this.controllerStep3.setValueNotificationFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE));
							this.controllerStep3.setValueNotificationAccount(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT));
							this.controllerStep3.setValueNotificationTemplate(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE));
							this.controllerStep3.setValueWorkflowAttributesGrid(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES));
							this.controllerStep3.setValueWorkflowCombo(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME));
							this.controllerStep3.setValueWorkflowFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE));

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
		onTaskManagerFormTaskEventSynchronousSaveButtonClick: function () {
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				submitDatas[CMDBuild.core.constants.Proxy.PHASE] = formData[CMDBuild.core.constants.Proxy.PHASE];
				submitDatas[CMDBuild.core.constants.Proxy.GROUPS] = Ext.encode(this.controllerStep1.getValueGroups());

				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var notificationFieldsetCheckboxValue = this.controllerStep3.getValueNotificationFieldsetCheckbox();
					if (notificationFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE] = notificationFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_ACCOUNT];
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE];
					}

					var workflowFieldsetCheckboxValue = this.controllerStep3.getValueWorkflowFieldsetCheckbox();
					if (workflowFieldsetCheckboxValue) {
						var attributesGridValues = this.controllerStep3.getValueWorkflowAttributeGrid();

						if (!Ext.Object.isEmpty(attributesGridValues))
							submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES] = Ext.encode(attributesGridValues);

						submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE] = workflowFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME];
					}

				// Form submit values formatting
					var filterData = this.controllerStep2.getDataFilters();
				if (!Ext.isEmpty(filterData))
					submitDatas[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(filterData);

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.CLASS_NAME];
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.event.Synchronous.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.event.Synchronous.update({
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

				CMDBuild.proxy.administration.taskManager.task.event.Synchronous.remove({
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
			// Phase validation
			this.controllerStep1.setAllowBlankPhaseCombo(!enable);

			// Notification validation
			this.controllerStep3.getNotificationDelegate().validate(
				this.controllerStep3.getValueNotificationFieldsetCheckbox()
				&& enable
			);

			// Workflow form validation
			this.controllerStep3.getWorkflowDelegate().validate(
				this.controllerStep3.getValueWorkflowFieldsetCheckbox()
				&& enable
			);

			return this.callParent(arguments);
		}
	});

})();
