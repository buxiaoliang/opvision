(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.Grid', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.Grid',
			'CMDBuild.proxy.administration.taskManager.task.Connector',
			'CMDBuild.proxy.administration.taskManager.task.Email',
			'CMDBuild.proxy.administration.taskManager.task.event.Asynchronous',
			'CMDBuild.proxy.administration.taskManager.task.event.Event',
			'CMDBuild.proxy.administration.taskManager.task.event.Synchronous',
			'CMDBuild.proxy.administration.taskManager.task.Generic',
			'CMDBuild.proxy.administration.taskManager.task.Workflow'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.TaskManager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerGridCyclicExecutionButtonClick',
			'onTaskManagerGridSingleExecutionButtonClick',
			'onTaskManagerGridStopButtonClick',
			'taskManagerGridApplyStoreEvent',
			'taskManagerGridClearSelection',
			'taskManagerGridConfigure',
			'taskManagerGridRecordSelect = taskManagerRecordSelect',
			'taskManagerGridStoreLoad = taskManagerStoreLoad'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.GridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.TaskManager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.GridPanel', { delegate: this });
		},

		/**
		 * Select first store record as default store load callback
		 *
		 * @param {Array} records
		 * @param {Object} operation
		 * @param {Boolean} success
		 *
		 * @returns {Void}
		 */
		defaultStoreCallback: function (records, operation, success) {
			if (Ext.isEmpty(records)) {
				this.cmfg('taskManagerClearSelection');
			} else {
				if (!this.view.getSelectionModel().hasSelection())
					this.view.getSelectionModel().select(0);
			}
		},

		/**
		 * @param {CMDBuild.model.administration.taskManager.Grid} record
		 *
		 * @returns {Void}
		 */
		onTaskManagerGridCyclicExecutionButtonClick: function (record) {
			this.cmfg('taskManagerModifyCancel');

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.administration.taskManager.Grid.cyclicExecution({
				params: params,
				scope: this,
				callback: function (options, success, response) {
					this.view.getStore().load();
				}
			});
		},

		/**
		 * @param {CMDBuild.model.administration.taskManager.Grid} record
		 *
		 * @returns {Void}
		 */
		onTaskManagerGridSingleExecutionButtonClick: function (record) {
			this.cmfg('taskManagerModifyCancel');

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.administration.taskManager.Grid.singleExecution({
				params: params,
				scope: this,
				callback: function (options, success, response) {
					this.view.getStore().load();
				}
			});
		},

		/**
		 * @param {CMDBuild.model.administration.taskManager.Grid} record
		 *
		 * @returns {Void}
		 */
		onTaskManagerGridStopButtonClick: function (record) {
			this.cmfg('taskManagerModifyCancel');

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID);

			CMDBuild.proxy.administration.taskManager.Grid.stop({
				params: params,
				scope: this,
				callback: function (options, success, response) {
					this.view.getStore().load();
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {String} parameters.eventName
		 * @param {Function} parameters.fn
		 * @param {Object} parameters.scope
		 * @param {Object} parameters.options
		 *
		 * @returns {Void}
		 */
		taskManagerGridApplyStoreEvent: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isString(parameters.eventName) && !Ext.isEmpty(parameters.eventName)
				&& Ext.isFunction(parameters.fn)
			) {
				this.view.getStore().on(
					parameters.eventName,
					parameters.fn,
					Ext.isObject(parameters.scope) ? parameters.scope : this,
					Ext.isObject(parameters.options) ? parameters.options : {}
				);
			} else {
				_error('taskManagerGridApplyStoreEvent(): unmanaged parameters object', this, parameters);
			}
		},

		/**
		 * @returns {Void}
		 */
		taskManagerGridClearSelection: function () {
			this.view.getSelectionModel().deselectAll();
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.storeLoadParameters
		 * @param {Array} parameters.type
		 *
		 * @returns {Void}
		 */
		taskManagerGridConfigure: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isArray(parameters.type) && !Ext.isEmpty(parameters.type)
			) {
				switch (parameters.type[0]) {
					case 'connector': {
						this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.Connector.getStore());
					} break;

					case 'email': {
						this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.Email.getStore());
					} break;

					case 'event': {
						switch (parameters.type[1]) {
							case 'asynchronous': {
								this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.event.Asynchronous.getStore());
							} break;

							case 'synchronous': {
								this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.event.Synchronous.getStore());
							} break;

							default: {
								this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.event.Event.getStore());
							}
						}
					} break;

					case 'generic': {
						this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.Generic.getStore());
					} break;

					case 'workflow': {
						this.view.reconfigure(CMDBuild.proxy.administration.taskManager.task.Workflow.getStore());
					} break;

					case 'all':
					default: {
						this.view.reconfigure(CMDBuild.proxy.administration.taskManager.Grid.getStore());
					}
				}

				// Stores are manually loaded because it's impossible to get first load of store with autoload true in this implementation context
				this.cmfg('taskManagerGridStoreLoad', parameters.storeLoadParameters);
			} else {
				_error('taskManagerGridConfigure(): wronf parameters object', this, parameters);
			}
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 */
		taskManagerGridRecordSelect: function (id) {
			id = Ext.isString(id) ? parseInt(id) : id;

			var rowIndex = 0;

			if (Ext.isNumber(id) && !Ext.isEmpty(id))
				rowIndex = this.view.getStore().find( CMDBuild.core.constants.Proxy.ID, id);

			this.cmfg('taskManagerGridClearSelection');

			this.view.getSelectionModel().select(
				rowIndex < 0 ? 0 : rowIndex,
				true
			);
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		taskManagerGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : this.defaultStoreCallback;
			parameters.scope = Ext.isEmpty(parameters.scope) ? this : parameters.scope;

			this.view.getStore().load(parameters);
		}
	});

})();
