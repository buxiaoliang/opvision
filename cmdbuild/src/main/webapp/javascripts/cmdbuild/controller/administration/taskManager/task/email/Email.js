(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.email.Email', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Email'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskAbortButtonClick',
			'onTaskManagerFormTaskCloneButtonClick',
			'onTaskManagerFormTaskEmailAddButtonClick = onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskEmailModifyButtonClick = onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskEmailRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskEmailSaveButtonClick = onTaskManagerFormTaskSaveButtonClick',
			'onTaskManagerFormTaskRemoveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.email.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		controllerStep2: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.email.Step3}
		 */
		controllerStep3: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.email.Step4}
		 */
		controllerStep4: undefined,

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
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.email.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', { parentDelegate: this });
			this.controllerStep3 = Ext.create('CMDBuild.controller.administration.taskManager.task.email.Step3', { parentDelegate: this });
			this.controllerStep4 = Ext.create('CMDBuild.controller.administration.taskManager.task.email.Step4', { parentDelegate: this });

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
		onTaskManagerFormTaskEmailAddButtonClick: function () {
			this.onTaskManagerFormTaskAddButtonClick(arguments); // CallParent alias

			this.controllerStep4.eraseWorkflowForm();
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEmailModifyButtonClick: function () {
			this.onTaskManagerFormTaskModifyButtonClick(arguments); // CallParent alias

			if (!this.controllerStep4.checkWorkflowComboSelected())
				this.controllerStep4.setDisabledWorkflowAttributesGrid(true);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskEmailRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Email.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.email.Email', decodedResponse);

							// FIXME: loadRecord() fails with comboboxes, and i can't find a working fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueEmailAccount(record.get(CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT));
							this.controllerStep1.setValueFilterType(record.get(CMDBuild.core.constants.Proxy.FILTER_TYPE));
							this.controllerStep1.setValueFilterFunction(record.get(CMDBuild.core.constants.Proxy.FILTER_FUNCTION));
							this.controllerStep1.setValueFilterFromAddress(
								this.controllerStep1.getFromAddressFilterDelegate().filterStringBuild(
									record.get(CMDBuild.core.constants.Proxy.FILTER_FROM_ADDRESS)
								)
							);
							this.controllerStep1.setValueFilterSubject(
								this.controllerStep1.getSubjectFilterDelegate().filterStringBuild(
									record.get(CMDBuild.core.constants.Proxy.FILTER_SUBJECT)
								)
							);
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));
							this.controllerStep1.setValueIncomingFolder(record.get(CMDBuild.core.constants.Proxy.INCOMING_FOLDER));
							this.controllerStep1.setValueProcessedFolder(record.get(CMDBuild.core.constants.Proxy.PROCESSED_FOLDER));
							this.controllerStep1.setValueRejectedFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.REJECT_NOT_MATCHING));
							this.controllerStep1.setValueRejectedFolder(record.get(CMDBuild.core.constants.Proxy.REJECTED_FOLDER));

							// Setup step 2
							this.controllerStep2.setValueAdvancedFields(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));
							this.controllerStep2.setValueBase(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));

							// Setup step 3
							this.controllerStep3.setValueAttachmentsFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.ATTACHMENTS_ACTIVE));
							this.controllerStep3.setValueAttachmentsCombo(record.get(CMDBuild.core.constants.Proxy.ATTACHMENTS_CATEGORY));
							this.controllerStep3.setValueNotificationFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE));
							this.controllerStep3.setValueNotificationTemplate(record.get(CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE));
							this.controllerStep3.setValueParsingFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.PARSING_ACTIVE));
							this.controllerStep3.setValueParsingFields(
								record.get(CMDBuild.core.constants.Proxy.PARSING_KEY_INIT),
								record.get(CMDBuild.core.constants.Proxy.PARSING_KEY_END),
								record.get(CMDBuild.core.constants.Proxy.PARSING_VALUE_INIT),
								record.get(CMDBuild.core.constants.Proxy.PARSING_VALUE_END)
							);

							// Setup step 4
							this.controllerStep4.setValueWorkflowAttributesGrid(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES));
							this.controllerStep4.setValueWorkflowCombo(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME));
							this.controllerStep4.setValueWorkflowFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE));

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
		onTaskManagerFormTaskEmailSaveButtonClick: function () {
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				submitDatas[CMDBuild.core.constants.Proxy.CRON_EXPRESSION] = this.controllerStep2.getCronDelegate().getValue();

				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var rejectedFieldsetCheckboxValue = this.controllerStep1.getValueRejectedFieldsetCheckbox();
					if (rejectedFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.REJECT_NOT_MATCHING] = rejectedFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.REJECTED_FOLDER] = formData[CMDBuild.core.constants.Proxy.REJECTED_FOLDER];
					}

					var filterFieldsetComboValue = this.controllerStep1.view.filterTypeCombobox.getValue();
					if (filterFieldsetComboValue) {
						submitDatas[CMDBuild.core.constants.Proxy.FILTER_TYPE] = formData[CMDBuild.core.constants.Proxy.FILTER_TYPE];

						switch (filterFieldsetComboValue) {
							case 'function': {
								submitDatas[CMDBuild.core.constants.Proxy.FILTER_FUNCTION] = formData[CMDBuild.core.constants.Proxy.FILTER_FUNCTION];
							} break;

							case 'regex': {
								// Form submit values formatting
								if (!Ext.isEmpty(formData.filterFromAddress))
									submitDatas[CMDBuild.core.constants.Proxy.FILTER_FROM_ADDRESS] = Ext.encode(
										formData[CMDBuild.core.constants.Proxy.FILTER_FROM_ADDRESS].split(
											this.controllerStep1.getFromAddressFilterDelegate().getTextareaConcatParameter()
										)
									);

								if (!Ext.isEmpty(formData.filterSubject))
									submitDatas[CMDBuild.core.constants.Proxy.FILTER_SUBJECT] = Ext.encode(
										formData[CMDBuild.core.constants.Proxy.FILTER_SUBJECT].split(
											this.controllerStep1.getSubjectFilterDelegate().getTextareaConcatParameter()
										)
									);
							} break;
						}
					}

					var attachmentsFieldsetCheckboxValue = this.controllerStep3.getValueAttachmentsFieldsetCheckbox();
					if (attachmentsFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.ATTACHMENTS_ACTIVE] = attachmentsFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.ATTACHMENTS_CATEGORY] = formData[CMDBuild.core.constants.Proxy.ATTACHMENTS_CATEGORY];
					}

					var notificationFieldsetCheckboxValue = this.controllerStep3.getValueNotificationFieldsetCheckbox();
					if (notificationFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_ACTIVE] = notificationFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE] = formData[CMDBuild.core.constants.Proxy.NOTIFICATION_EMAIL_TEMPLATE];
					}

					var parsingFieldsetCheckboxValue = this.controllerStep3.getValueParsingFieldsetCheckbox();
					if (parsingFieldsetCheckboxValue) {
						submitDatas[CMDBuild.core.constants.Proxy.PARSING_ACTIVE] = parsingFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.PARSING_KEY_END] = formData[CMDBuild.core.constants.Proxy.PARSING_KEY_END];
						submitDatas[CMDBuild.core.constants.Proxy.PARSING_KEY_INIT] = formData[CMDBuild.core.constants.Proxy.PARSING_KEY_INIT];
						submitDatas[CMDBuild.core.constants.Proxy.PARSING_VALUE_END] = formData[CMDBuild.core.constants.Proxy.PARSING_VALUE_END];
						submitDatas[CMDBuild.core.constants.Proxy.PARSING_VALUE_INIT] = formData[CMDBuild.core.constants.Proxy.PARSING_VALUE_INIT];
					}

					var workflowFieldsetCheckboxValue = this.controllerStep4.getValueWorkflowFieldsetCheckbox();
					if (workflowFieldsetCheckboxValue) {
						var attributesGridValues = this.controllerStep4.getValueWorkflowAttributeGrid();

						if (!Ext.Object.isEmpty(attributesGridValues))
							submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES] = Ext.encode(attributesGridValues);

						submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE] = workflowFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME];
					}

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT] = formData[CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];
				submitDatas[CMDBuild.core.constants.Proxy.INCOMING_FOLDER] = formData[CMDBuild.core.constants.Proxy.INCOMING_FOLDER];
				submitDatas[CMDBuild.core.constants.Proxy.PROCESSED_FOLDER] = formData[CMDBuild.core.constants.Proxy.PROCESSED_FOLDER];

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.Email.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.Email.update({
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

				CMDBuild.proxy.administration.taskManager.task.Email.remove({
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
			// Email account and forlders validation
			this.controllerStep1.setAllowBlankEmailAccountCombo(!enable);
			this.controllerStep1.setAllowBlankIncomingFolder(!enable);
			this.controllerStep1.setAllowBlankProcessedFolder(!enable);

			// Rejected folder validation
			this.controllerStep1.setAllowBlankRejectedFolder(!this.controllerStep1.getValueRejectedFieldsetCheckbox());

			// Cron field validation
			this.controllerStep2.getCronDelegate().validate(enable);

			// Parsing validation
			if (this.controllerStep3.getValueParsingFieldsetCheckbox() && enable) {
				this.controllerStep3.setAllowBlankParsingFields(false);
			} else {
				this.controllerStep3.setAllowBlankParsingFields(true);
			}

			// Notification validation
			this.controllerStep3.getNotificationDelegate().validate(
				this.controllerStep3.getValueNotificationFieldsetCheckbox()
				&& enable
			);

			// Attachments validation
			if (this.controllerStep3.getValueAttachmentsFieldsetCheckbox() && enable) {
				this.controllerStep3.setAllowBlankAttachmentsField(false);
			} else {
				this.controllerStep3.setAllowBlankAttachmentsField(true);
			}

			// Workflow form validation
			this.controllerStep4.getWorkflowDelegate().validate(
				this.controllerStep4.getValueWorkflowFieldsetCheckbox()
				&& enable
			);

			return this.callParent(arguments);
		}
	});

})();
