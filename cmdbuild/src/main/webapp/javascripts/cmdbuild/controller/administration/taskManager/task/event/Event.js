(function() {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.Event', {
		extend: 'CMDBuild.controller.administration.taskManager.task.Abstract',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskAbortButtonClick -> controllerTaskEvent',
			'onTaskManagerFormTaskAddButtonClick -> controllerTaskEvent',
			'onTaskManagerFormTaskCloneButtonClick -> controllerTaskEvent',
			'onTaskManagerFormTaskModifyButtonClick -> controllerTaskEvent',
			'onTaskManagerFormTaskRemoveButtonClick -> controllerTaskEvent',
			'onTaskManagerFormTaskRowSelected -> controllerTaskEvent',
			'onTaskManagerFormTaskSaveButtonClick -> controllerTaskEvent'
		],

		/**
		 * @property {Object}
		 */
		controllerTaskEventEvent: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.Form} configurationObject.parentDelegate
		 * @param {String} configurationObject.subType
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			var subType = configurationObject.subType;

			this.callParent(arguments);

			// Build sub controller
			this.controllerTaskEvent = this.controllerBuilder(subType);
		},

		/**
		 * @param {String} subType
		 *
		 * @returns {Object}
		 *
		 * @private
		 */
		controllerBuilder: function (subType) {
			switch (subType) {
				case 'asynchronous':
					return Ext.create('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous', { parentDelegate: this });

				case 'synchronous':
					return Ext.create('CMDBuild.controller.administration.taskManager.task.event.synchronous.Synchronous', { parentDelegate: this });

				default:
					_error('constructor(): unmanaged event task subType', this, subType);
			}
		}
	});

})();
