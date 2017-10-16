(function () {

	Ext.define('CMDBuild.controller.common.field.comboBox.Icon', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onFieldComboBoxIconTrigger1Click',
			'onFieldComboBoxIconTrigger2Click'
		],

		/**
		 * @property {CMDBuild.view.common.field.comboBox.Icon}
		 */
		view: undefined,

		/**
		 * If store has more than configuration limit records, no drop down but opens searchWindow
		 *
		 * @returns {Void}
		 */
		onFieldComboBoxIconTrigger1Click: function () {
			this.view.onTriggerClick();
		},

		/**
		 * @returns {Void}
		 */
		onFieldComboBoxIconTrigger2Click: function () {
			if (!this.view.isDisabled())
				this.view.setValue();
		}
	});

})();
