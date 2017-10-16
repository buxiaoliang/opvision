(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.generic.Generic', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Generic'
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
			'onTaskManagerFormTaskAddButtonClick',
			'onTaskManagerFormTaskCloneButtonClick',
			'onTaskManagerFormTaskGenericRowSelected = onTaskManagerFormTaskRowSelected',
			'onTaskManagerFormTaskGenericSaveButtonClick = onTaskManagerFormTaskSaveButtonClick',
			'onTaskManagerFormTaskModifyButtonClick',
			'onTaskManagerFormTaskRemoveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.generic.Step1}
		 */
		controllerStep1: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.common.CronConfiguration}
		 */
		controllerStep2: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.generic.Step3}
		 */
		controllerStep3: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.generic.Step4}
		 */
		controllerStep4: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.task.generic.Step5}
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
			this.controllerStep1 = Ext.create('CMDBuild.controller.administration.taskManager.task.generic.Step1', { parentDelegate: this });
			this.controllerStep2 = Ext.create('CMDBuild.controller.administration.taskManager.task.common.CronConfiguration', { parentDelegate: this });
			this.controllerStep3 = Ext.create('CMDBuild.controller.administration.taskManager.task.generic.Step3', { parentDelegate: this });
			this.controllerStep4 = Ext.create('CMDBuild.controller.administration.taskManager.task.generic.Step4', { parentDelegate: this });
			this.controllerStep5 = Ext.create('CMDBuild.controller.administration.taskManager.task.generic.Step5', { parentDelegate: this });

			this.cmfg('taskManagerFormPanelsAdd', [
				this.controllerStep1.getView(),
				this.controllerStep2.getView(),
				this.controllerStep3.getView(),
				this.controllerStep4.getView(),
				this.controllerStep5.getView()
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerFormTaskGenericRowSelected: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('taskManagerSelectedTaskGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.taskManager.task.Generic.read({
					params: params,
					scope: this,
					success: function (rensponse, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							var record = Ext.create('CMDBuild.model.administration.taskManager.task.generic.Generic', decodedResponse);
							record.set(CMDBuild.core.constants.Proxy.CONTEXT, record.get(CMDBuild.core.constants.Proxy.CONTEXT)['client']); // FIXME: multiple sub-context predisposition

							// FIXME: loadRecord() fails with comboboxes, and i can't find a working fix, so i must set all fields manually

							// Setup step 1
							this.controllerStep1.setValueActive(record.get(CMDBuild.core.constants.Proxy.ACTIVE));
							this.controllerStep1.setValueDescription(record.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
							this.controllerStep1.setValueId(record.get(CMDBuild.core.constants.Proxy.ID));

							// Setup step 2
							this.controllerStep2.setValueAdvancedFields(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));
							this.controllerStep2.setValueBase(record.get(CMDBuild.core.constants.Proxy.CRON_EXPRESSION));

							// Setup step 3
							this.controllerStep3.setData(record.get(CMDBuild.core.constants.Proxy.CONTEXT));

							// Setup step 4
							this.controllerStep4.setValueEmailAccount(record.get(CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT));
							this.controllerStep4.setValueEmailTemplate(record.get(CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE));

							// Setup step 5
							this.controllerStep5.setValueReportAttributesGrid(record.get(CMDBuild.core.constants.Proxy.REPORT_PARAMETERS));
							this.controllerStep5.setValueReportCombo(record.get(CMDBuild.core.constants.Proxy.REPORT_NAME));
							this.controllerStep5.setValueReportExtension(record.get(CMDBuild.core.constants.Proxy.REPORT_EXTENSION));
							this.controllerStep5.setValueReportFieldsetCheckbox(record.get(CMDBuild.core.constants.Proxy.REPORT_ACTIVE));

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
		onTaskManagerFormTaskGenericSaveButtonClick: function () {
			var formData = this.cmfg('taskManagerFormViewDataGet', true);
			var submitDatas = {};

			// Validate before save
			if (this.validate(formData[CMDBuild.core.constants.Proxy.ACTIVE])) {
				submitDatas[CMDBuild.core.constants.Proxy.ACTIVE] = formData[CMDBuild.core.constants.Proxy.ACTIVE];
				submitDatas[CMDBuild.core.constants.Proxy.CRON_EXPRESSION] = this.controllerStep2.getCronDelegate().getValue();
				submitDatas[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				submitDatas[CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT] = formData[CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT];
				submitDatas[CMDBuild.core.constants.Proxy.EMAIL_ACTIVE] = true; // Fixed value untill refactor
				submitDatas[CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE] = formData[CMDBuild.core.constants.Proxy.EMAIL_TEMPLATE];
				submitDatas[CMDBuild.core.constants.Proxy.ID] = formData[CMDBuild.core.constants.Proxy.ID];

				var contextData = this.controllerStep3.getData();
				if (!Ext.isEmpty(contextData))
					submitDatas[CMDBuild.core.constants.Proxy.CONTEXT] = Ext.encode({ client: contextData }); // FIXME: multiple sub-context predisposition

				// Fieldset submitting filter to avoid to send datas if fieldset are collapsed
					var reportFieldsetCheckboxValue = this.controllerStep5.getValueReportFieldsetCheckbox();
					if (reportFieldsetCheckboxValue) {
						var attributesGridValues = this.controllerStep5.getValueReportAttributeGrid();

						if (!Ext.Object.isEmpty(attributesGridValues))
							submitDatas[CMDBuild.core.constants.Proxy.REPORT_PARAMETERS] = Ext.encode(attributesGridValues);

						submitDatas[CMDBuild.core.constants.Proxy.REPORT_ACTIVE] = reportFieldsetCheckboxValue;
						submitDatas[CMDBuild.core.constants.Proxy.REPORT_EXTENSION] = formData[CMDBuild.core.constants.Proxy.REPORT_EXTENSION];
						submitDatas[CMDBuild.core.constants.Proxy.REPORT_NAME] = formData[CMDBuild.core.constants.Proxy.REPORT_NAME];
					}

				if (Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.taskManager.task.Generic.create({
						params: submitDatas,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.taskManager.task.Generic.update({
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

				CMDBuild.proxy.administration.taskManager.task.Generic.remove({
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
			this.controllerStep2.getCronDelegate().validate(enable);

			// Report fieldset validation
			this.controllerStep5.getReportDelegate().cmfg('onTaskManagerReportFormValidationEnable', (
				enable && this.controllerStep5.getValueReportFieldsetCheckbox()
			));

			return this.callParent(arguments);
		}
	});

})();
