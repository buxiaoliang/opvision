(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.workflow.Workflow', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Workflow'
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
			'onTaskManagerFormTaskRemoveButtonClick',
			'onTaskManagerFormTaskWorkflowAddButtonClick = onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskWorkflowModifyButtonClick = onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskWorkflowRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskWorkflowSaveButtonClick = onTaskManagerFormTaskSaveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.workflow.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		controllerStep2: undefined,

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
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.workflow.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', { parentDelegate: this });

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView()
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskWorkflowAddButtonClick: function () {
			this.onTaskManagerFormTaskAddButtonClick(arguments); // CallParent alias

			this.controllerStep1.eraseWorkflowForm();
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskWorkflowModifyButtonClick: function () {
			this.onTaskManagerFormTaskModifyButtonClick(arguments); // CallParent alias

			if (!this.controllerStep1.checkWorkflowComboSelected())
				this.controllerStep1.setDisabledWorkflowAttributesGrid(true);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskWorkflowRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Workflow.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.workflow.Workflow', decodedResponse);

							// FIXME: loadRecord() fails with comboboxes, and i can't find good fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));
							this.controllerStep1.setValueWorkflowAttributesGrid(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES));
							this.controllerStep1.setValueWorkflowCombo(record.get(CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME));

							// Setup step 2
							this.controllerStep2.setValueBase(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));
							this.controllerStep2.setValueAdvancedFields(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));

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
		onTaskManagerFormTaskWorkflowSaveButtonClick: function () {
			var attributesGridValues = this.controllerStep1.getValueWorkflowAttributeGrid();
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				submitDatas[CMDBuild.core.constants.Proxy.CRON_EXPRESSION] = this.controllerStep2.getCronDelegate().getValue();

				// Form submit values formatting
				if (!Ext.Object.isEmpty(attributesGridValues))
					submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_ATTRIBUTES] = Ext.encode(attributesGridValues);

				// Data filtering to submit only right values
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];
				submitDatas[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME] = formData[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME];

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.Workflow.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.Workflow.update({
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

				CMDBuild.proxy.administration.taskManager.task.Workflow.remove({
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
			// Workflow form validation
			this.controllerStep1.getWorkflowDelegate().validate(enable);

			// Cron field validation
			this.controllerStep2.getCronDelegate().validate(enable);

			return this.callParent(arguments);
		}
	});

})();
