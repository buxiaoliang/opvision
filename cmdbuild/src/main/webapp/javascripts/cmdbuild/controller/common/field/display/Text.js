(function () {

	Ext.define('CMDBuild.controller.common.field.display.Text', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Mixed}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onFieldDisplayTextDetailsButtonClick',
			'onFieldDisplayTextRawValueGet',
			'onFieldDisplayTextReset',
			'onFieldDisplayTextValueGet',
			'onFieldDisplayTextValueIsValid',
			'onFieldDisplayTextValueSet'
		],

		/**
		 * @property {CMDBuild.view.common.field.display.DetailsWindow}
		 */
		detailsWindow: undefined,

		/**
		 * @property {CMDBuild.view.common.field.display.Text}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.view.common.field.display.Text} configurationObject.view
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Details window build
			this.detailsWindow = Ext.create('CMDBuild.view.common.field.display.DetailsWindow', { title: this.view.fieldLabel });
		},

		/**
		 * @returns {Void}
		 */
		onFieldDisplayTextDetailsButtonClick: function () {
			this.detailsWindow.configureAndShow(this.cmfg('onFieldDisplayTextValueGet'));
		},

		/**
		 * @returns {String}
		 */
		onFieldDisplayTextRawValueGet: function() {
			return this.view.displayField.getRawValue();
		},

		/**
		 * @returns {Void}
		 */
		onFieldDisplayTextReset: function () {
			this.view.detailsButton.hide();
			this.view.displayField.reset();
		},

		/**
		 * @returns {String}
		 */
		onFieldDisplayTextValueGet: function () {
			return this.view.displayField.getValue();
		},

		/**
		 * @returns {Boolean}
		 */
		onFieldDisplayTextValueIsValid: function () {
			return this.view.displayField.isValid();
		},

		/**
		 * @param {String or Object} value
		 *
		 * @returns {Void}
		 */
		onFieldDisplayTextValueSet: function (value) {
			if (!Ext.isEmpty(value)) {
				this.view.detailsButton.hide();
				this.view.displayField.setValue(value);

				if (this.view.isVisible() && this.view.displayField.getHeight() > this.view.maxHeight) {
					this.view.detailsButton.show();
					this.view.displayField.setHeight(this.view.maxHeight);
				}
			}
		}
	});

})();
