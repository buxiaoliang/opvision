(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.generic.Step1', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Generic}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			// TODO
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.generic.Step1}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.generic.Generic} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.generic.Step1', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {String}
			 */
			getValueId: function () {
				return this.view.idField.getValue();
			},

		// SETters functions
			/**
			 * @param {Boolean} state
			 */
			setDisabledTypeField: function (state) {
				this.view.typeField.setDisabled(state);
			},

			/**
			 * @param {String} value
			 */
			setValueActive: function (value) {
				this.view.activeField.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueDescription: function (value) {
				this.view.descriptionField.setValue(value);
			},

			/**
			 * @param {Int} value
			 */
			setValueId: function (value) {
				this.view.idField.setValue(value);
			}
	});

})();
