(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EmailFilterForm', {

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditButton}
		 */
		buttonField: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditWindowWindow}
		 */
		filterWindow: undefined,

		/**
		 * @property {String}
		 */
		textAreaFieldValueBuffer: undefined,

		/**
		 * @cfg {String}
		 */
		textareaConcatParameter: ' OR ',

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.Textarea}
		 */
		textareaField: undefined,

		/**
		 * Gatherer function to catch events
		 *
		 * @param {String} name
		 * @param {Object} param
		 * @param {Function} callback
		 */
		cmOn: function (name, param, callBack) {
			switch (name) {
				case 'onFilterButtonClick':
					return this.onFilterButtonClick(param.titleWindow, param.type);

				case 'onFilterWindowChange':
					return this.onFilterChange(param);

				case 'onFilterWindowAbort':
					return this.onFilterWindowAbort();

				case 'onFilterWindowConfirm':
					return this.filterWindow.hide();

				default: {
					if (!Ext.isEmpty(this.parentDelegate))
						return this.parentDelegate.cmOn(name, param, callBack);
				}
			}
		},

		/**
		 * Concats array's items with textareaConcatParameter
		 *
		 * @param {Array} parameters
		 *
		 * @return {String} filterString
		 */
		filterStringBuild: function (parameters) {
			var filterString = '';

			if (typeof parameters == 'object') {
				for (var key in parameters) {
					if (!Ext.isEmpty(parameters[key])) {
						if (!Ext.isEmpty(filterString))
							filterString = filterString + this.getTextareaConcatParameter();

						filterString = filterString.concat(parameters[key]);
					}
				}
			} else  {
				var filterString = parameters;
			}

			return filterString;
		},

		// GETters functions
			/**
			 * @return {String}
			 */
			getTextareaConcatParameter: function () {
				return this.textareaConcatParameter;
			},

		/**
		 * Creates filter window structure
		 *
		 * @param {String} titleWindow
		 * @param {String} type
		 * @param {String} content
		 */
		onFilterButtonClick: function (titleWindow, type, content) {
			this.textAreaFieldValueBuffer = this.textareaField.getValue();

			this.filterWindow = Ext.create('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditWindowWindow', {
				title: titleWindow,
				type: type,
				content: this.textareaField.getValue(),
				textareaConcatParameter: this.getTextareaConcatParameter()
			});

			this.filterWindow.delegate.parentDelegate = this;
			this.filterWindow.show();
		},

		/**
		 * @param {Array} parameters
		 */
		onFilterChange: function (parameters) {
			this.textareaField.setValue(this.filterStringBuild(parameters));
		},

		onFilterWindowAbort: function () {
			this.textareaField.setValue(this.textAreaFieldValueBuffer);
			this.filterWindow.hide();
		},

		// SETters functions
			/**
			 * @param {String} value
			 */
			setValue: function (value) {
				this.textareaField.setValue(value);
			}
	});

})();
