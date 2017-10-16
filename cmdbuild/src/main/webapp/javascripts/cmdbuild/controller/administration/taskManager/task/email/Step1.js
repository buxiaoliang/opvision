(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.email.Step1', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Email}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onFilterTypeComboChange'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.email.Step1}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.email.Email} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.email.Step1', { delegate: this });
		},

		// GETters functions
			/**
			 * @return {CMDBuild.controller.administration.tasks.common.emailFilterForm.CMEmailFilterFormController} delegate
			 */
			getFromAddressFilterDelegate: function () {
				return this.view.fromAddresFilter.delegate;
			},

			/**
			 * @return {CMDBuild.controller.administration.tasks.common.emailFilterForm.CMEmailFilterFormController} delegate
			 */
			getSubjectFilterDelegate: function () {
				return this.view.subjectFilter.delegate;
			},

			/**
			 * @return {Boolean}
			 */
			getValueRejectedFieldsetCheckbox: function () {
				return this.view.rejectedFieldset.checkboxCmp.getValue();
			},

			/**
			 * @return {String}
			 */
			getValueId: function () {
				return this.view.idField.getValue();
			},

		onFilterTypeComboChange: function () {
			this.view.filterDefinitionContainer.removeAll(false);

			switch (this.view.filterTypeCombobox.getValue()) {
				case 'regex':
					return this.view.filterDefinitionContainer.add([this.view.fromAddresFilter, this.view.subjectFilter]);

				case 'function':
					return this.view.filterDefinitionContainer.add(this.view.filterFunctionCombobox);

				case 'none':
				default:
					return;
			}
		},

		// SETters functions
			/**
			 * @param {Boolean} state
			 */
			setAllowBlankIncomingFolder: function (state) {
				this.view.incomingFolder.allowBlank = state;
			},

			/**
			 * @param {Boolean} state
			 */
			setAllowBlankEmailAccountCombo: function (state) {
				this.view.emailAccountCombo.allowBlank = state;
			},

			/**
			 * @param {Boolean} state
			 */
			setAllowBlankProcessedFolder: function (state) {
				this.view.processedFolder.allowBlank = state;
			},

			/**
			 * @param {Boolean} state
			 */
			setAllowBlankRejectedFolder: function (state) {
				this.view.rejectedFolder.allowBlank = state;
			},

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
			 * @param {String} value
			 */
			setValueEmailAccount: function (value) {
				this.view.emailAccountCombo.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueFilterFromAddress: function (value) {
				this.getFromAddressFilterDelegate().setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueFilterFunction: function (value) {
				this.view.filterFunctionCombobox.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueFilterSubject: function (value) {
				this.getSubjectFilterDelegate().setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueFilterType: function (value) {
				this.view.filterTypeCombobox.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueIncomingFolder: function (value) {
				this.view.incomingFolder.setValue(value);
			},

			/**
			 * @param {String} value
			 */
			setValueProcessedFolder: function (value) {
				this.view.processedFolder.setValue(value);
			},

			/**
			 * @param {Boolean} state
			 */
			setValueRejectedFieldsetCheckbox: function (state) {
				if (state) {
					this.view.rejectedFieldset.expand();
				} else {
					this.view.rejectedFieldset.collapse();
				}
			},

			/**
			 * @param {String} value
			 */
			setValueRejectedFolder: function (value) {
				this.view.rejectedFolder.setValue(value);
			},

			/**
			 * @param {Int} value
			 */
			setValueId: function (value) {
				this.view.idField.setValue(value);
			}
	});

})();
