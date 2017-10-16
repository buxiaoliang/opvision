(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.TaskManager', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.controller.administration.taskManager.ExternalServices'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerItemDoubleClick',
			'onTaskManagerModuleInit = onModuleInit',
			'onTaskManagerRowSelected',
			'taskManagerClearSelection',
			'taskManagerExternalServicesAddButtonClick',
			'taskManagerExternalServicesFormStateManager',
			'taskManagerExternalServicesItemDoubleClick',
			'taskManagerExternalServicesModifyButtonClick',
			'taskManagerModifyCancel -> controllerForm',
			'taskManagerRecordSelect -> controllerGrid',
			'taskManagerSelectedTaskGet',
			'taskManagerSelectedTaskIsEmpty',
			'taskManagerStoreLoad -> controllerGrid'
		],

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.Form}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.administration.taskManager.Grid}
		 */
		controllerGrid: undefined,

		/**
		 * @property {CMDBuild.model.administration.taskManager.Grid}
		 *
		 * @private
		 */
		selectedTask: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.TaskManagerView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.MainViewport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.TaskManagerView', { delegate: this });

			// Build sub controllers
			this.controllerForm = Ext.create('CMDBuild.controller.administration.taskManager.Form', { parentDelegate: this });
			this.controllerGrid = Ext.create('CMDBuild.controller.administration.taskManager.Grid', { parentDelegate: this });

			// Inject panels
			this.view.add(this.controllerGrid.getView());
			this.view.add(this.controllerForm.getView());
		},

		/**
		 * @param {Array} type
		 */
		configureAddButton: function (type) {
			if (Ext.isArray(type) && !Ext.isEmpty(type)) {
				this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP).removeAll();

				switch (type[0]) {
					case 'all': {
						this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP).add(
							Ext.create('CMDBuild.core.buttons.iconized.split.add.Add', {
								text: CMDBuild.Translation.addTask,

								menu: Ext.create('Ext.menu.Menu', {
									items: [
										{
											text: CMDBuild.Translation.connector,
											scope: this,

											handler: function (button, e) {
												this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['connector']);
											}
										},
										{
											text: CMDBuild.Translation.email,
											scope: this,

											handler: function (button, e) {
												this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['email']);
											}
										},
										{
											text: CMDBuild.Translation.event,
											menu: [
												{
													text: CMDBuild.Translation.asynchronous,
													scope: this,

													handler: function (button, e) {
														this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['event', 'asynchronous']);
													}
												},
												{
													text: CMDBuild.Translation.synchronous,
													scope: this,

													handler: function (button, e) {
														this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['event', 'synchronous']);
													}
												}
											]
										},
										{
											text: CMDBuild.Translation.workflow,
											scope: this,

											handler: function (button, e) {
												this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['workflow']);
											}
										},
										{
											text: CMDBuild.Translation.others,
											menu: [
												{
													text: CMDBuild.Translation.sendEmail,
													scope: this,

													handler: function (button, e) {
														this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['generic']);
													}
												}
											]
										}
									]
								})
							})
						);
					} break;

					case 'event': {
						if (Ext.isEmpty(type[1])) {
							this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP).add(
									Ext.create('CMDBuild.core.buttons.iconized.split.add.Add', {
										text: CMDBuild.Translation.addTask,

										menu: Ext.create('Ext.menu.Menu', {
											items: [
												{
													text: CMDBuild.Translation.event,
													menu: [
														{
															text: CMDBuild.Translation.asynchronous,
															scope: this,
															handler: function () {
																this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['event', 'asynchronous']);
															}
														},
														{
															text: CMDBuild.Translation.synchronous,
															scope: this,
															handler: function () {
																this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', ['event', 'synchronous']);
															}
														}
													]
												}
											]
										})
									})
								);
						} else {
							this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP).add(
								Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
									text: CMDBuild.Translation.addTask,
									scope: this,

									handler: function (button, e) {
										this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', type);
									}
								})
							);
						}
					} break;

					default: {
						this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP).add(
							Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addTask,
								scope: this,

								handler: function (button, e) {
									this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', type);
								}
							})
						);
					}
				}
			} else {
				_error('configureAddButton(): unmanaged type property', this, type);
			}
		},

		/**
		 * Forwarder method
		 *
		 * @returns {Void}
		 */
		onTaskManagerItemDoubleClick: function () {
			this.controllerForm.cmfg('onTaskManagerFormModifyButtonClick');
		},

		/**
		 * @param {CMDBuild.model.common.Accordion} node
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onTaskManagerModuleInit: function (node) {
			if (Ext.isObject(node) && !Ext.Object.isEmpty(node)) {
				this.controllerGrid.cmfg('taskManagerGridConfigure', { type: node.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY) });

				this.configureAddButton(node.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY));

				this.setViewTitle(node.get(CMDBuild.core.constants.Proxy.TEXT));

				this.onModuleInit(node); // Custom callParent() implementation
			}
		},

		/**
		 * Forwarder method
		 *
		 * @param {CMDBuild.model.administration.taskManager.Grid} record
		 *
		 * @returns {Void}
		 */
		onTaskManagerRowSelected: function (record) {
			if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
				this.taskManagerSelectedTaskSet({ value: record });

				this.controllerForm.cmfg('onTaskManagerFormRowSelected');
			} else {
				_error('onTaskManagerRowSelected(): empty or wrong record parameter', this, record);
			}
		},

		// SelectedTask property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed}
			 */
			taskManagerSelectedTaskGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedTask';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			taskManagerSelectedTaskIsEmpty: function (attributePath) {
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
			taskManagerSelectedTaskReset: function (parameters) {
				this.propertyManageReset('selectedTask');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			taskManagerSelectedTaskSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.taskManager.Grid';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedTask';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.enableClearForm
		 * @param {Object} parameters.enableClearGrid
		 *
		 * @returns {Void}
		 */
		taskManagerClearSelection: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableClearForm = Ext.isBoolean(parameters.enableClearForm) ? parameters.enableClearForm : true;
			parameters.controllerGrid = Ext.isBoolean(parameters.controllerGrid) ? parameters.controllerGrid : true;

			this.taskManagerSelectedTaskReset();

			// Forward to sub controllers
			if (parameters.enableClearForm)
				this.controllerForm.cmfg('taskManagerFormClearSelection');

			if (parameters.enableClearGrid)
				this.controllerGrid.cmfg('taskManagerGridClearSelection');
		}
	});

})();
