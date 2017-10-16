(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step1', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.event.asynchronous.Step1}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.event.asynchronous.Step1', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {String}
			 */
			getValueId: function () {
				return this.view.idField.getValue();
			},

		/**
		 * @return {Boolean}
		 */
		isEmptyClass: function () {
			return Ext.isEmpty(this.view.classNameCombo.getValue());
		},

		// SETters functions
			/**
			 * @param {Boolean} state
			 */
			setDisabledTypeField: function (state) {
				this.view.typeField.setDisabled(state);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueActive: function (state) {
				this.view.activeField.setValue(state);
			},

			/**
			 * @param {String} value
			 */
			setValueClassName: function (value) {
				this.view.classNameCombo.setValue(value);

				// Manually select event fire
				this.cmfg('onTaskManagerFormTaskEventAsynchronousClassSelected', value);
			},

			/**
			 * @param {String} value
			 */
			setValueDescription: function (value) {
				this.view.descriptionField.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueId: function (value) {
				this.view.idField.setValue(value);
			}
	});

})();
