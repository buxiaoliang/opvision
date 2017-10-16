(function () {

	Ext.define('CMDBuild.override.form.field.File', {
		override: 'Ext.form.field.File',

		/**
		 * The origin function always return TRUE here. We want to switch on/off this functionality via 'submitValue' or 'disabled' - 26/01/2017
		 *
		 * @return {Boolean}
		 *
		 * @override
		 */
		isFileUpload: function () {
			return !(this.disabled || !this.submitValue);
		},

		/**
		 * Implementation - 26/01/2017
		 *
		 * @param {String} value
		 *
		 * @returns {Void}
		 */
		setEmptyText: function (value) {
			value = Ext.isString(value) ? value : ' ';

			this.emptyText = value;
			this.applyEmptyText(); // To correctly apply emptyText property
		}
	});

})();
