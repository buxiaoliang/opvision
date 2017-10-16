(function () {

	Ext.define('CMDBuild.controller.administration.workflow.tabs.TaskManager', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.workflow.tabs.Tasks'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.workflow.Workflow}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTabTasksAddButtonClick',
			'onWorkflowTabTasksAddWorkflowButtonClick',
			'onWorkflowTabTasksItemDoubleClick',
			'onWorkflowTabTasksModifyButtonClick',
			'onWorkflowTabTasksRemoveButtonClick',
			'onWorkflowTabTasksRowSelect',
			'onWorkflowTabTasksShow',
			'onWorkflowTabTasksWorkflowSelected'
		],

		/**
		 * @property {CMDBuild.view.administration.workflow.tabs.taskManager.GridPanel}
		 */
		grid: undefined,

		/**
		 * Just the grid subset of task properties, not a full task object
		 *
		 * @property {CMDBuild.model.administration.workflow.tabs.taskManager.Grid}
		 *
		 * @private
		 */
		selectedTask: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.workflow.tabs.taskManager.TaskManagerView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.workflow.tabs.taskManager.TaskManagerView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksAddButtonClick: function () {
			var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getTaskManager());

			if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
				moduleController.cmfg('taskManagerExternalServicesAddButtonClick', { type: ['workflow'] });
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksAddWorkflowButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @param {CMDBuild.model.administration.workflow.tabs.taskManager.Grid} record
		 *
		 * @returns {Void}
		 */
		onWorkflowTabTasksItemDoubleClick: function (record) {
			if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
				var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getTaskManager());

				if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
					moduleController.cmfg('taskManagerExternalServicesItemDoubleClick', {
						id: record.get(CMDBuild.core.constants.Proxy.ID),
						type: ['workflow']
					});
			} else {
				_error('onWorkflowTabTasksItemDoubleClick(): unmanaged record parameter', this, record);
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksModifyButtonClick: function () {
			if (this.grid.getSelectionModel().hasSelection()) {
				var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getTaskManager());
				var selectedRecord = this.grid.getSelectionModel().getSelection()[0];

				if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
					moduleController.cmfg('taskManagerExternalServicesModifyButtonClick', {
						id: selectedRecord.get(CMDBuild.core.constants.Proxy.ID),
						type: ['workflow']
					});
			} else {
				_error('onWorkflowTabTasksModifyButtonClick(): unmanaged selectedRecord parameter', this, record);
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksRemoveButtonClick: function () {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksRowSelect: function () {
			if (this.grid.getSelectionModel().hasSelection())
				this.selectedTaskSet({ value: this.grid.getSelectionModel().getSelection()[0] });

			this.view.setDisabledTopBar(!this.grid.getSelectionModel().hasSelection());
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabTasksShow: function () {
			if (!this.cmfg('workflowSelectedWorkflowIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.WORKFLOW_CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

				this.grid.getStore().load({
					params: params,
					scope: this,
					callback: function (records, operation, success) {
						if (!this.grid.getSelectionModel().hasSelection())
							this.grid.getSelectionModel().select(0, true);

						this.cmfg('onWorkflowTabTasksRowSelect');
					}
				});
			}
		},

		/**
		 * Enable/Disable tab on workflow selection
		 *
		 * @returns {Void}
		 */
		onWorkflowTabTasksWorkflowSelected: function () {
			this.view.setDisabled(
				this.cmfg('workflowSelectedWorkflowIsEmpty')
				|| this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
				|| this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
			);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function () {
			if (!this.selectedTaskIsEmpty()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.selectedTaskGet(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.workflow.tabs.Tasks.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.selectedTaskReset();

						this.cmfg('onWorkflowTabTasksShow');
					}
				});
			}
		},

		// SelectedTask property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			selectedTaskGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedTask';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			selectedTaskIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedTask';
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
			selectedTaskReset: function (parameters) {
				this.propertyManageReset('selectedTask');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectedTaskSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.workflow.tabs.taskManager.Grid';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedTask';

					this.propertyManageSet(parameters);
				}
			}
	});

})();
