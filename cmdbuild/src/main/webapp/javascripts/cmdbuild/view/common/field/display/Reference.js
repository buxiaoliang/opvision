(function () {

	Ext.define('CMDBuild.view.common.field.display.Reference', {
		extend: 'Ext.form.field.Display',

		/**
		 * @property {CMDBuild.controller.common.field.display.Reference}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.model.common.field.display.Reference}
		 *
		 * @private
		 */
		displayedValueObject: {},

		/**
		 * @cfg {String}
		 */
		targetClassName: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				delegate: Ext.create('CMDBuild.controller.common.field.display.Reference', { view: this })
			});

			this.callParent(arguments);
		},

		/**
		 * @returns {Number}
		 *
		 * @override
		 */
		getValue: function () {
			return this.delegate.cmfg('fieldDisplayReferenceValueGet');
		},

		/**
		 * @param {String or Object} value
		 *
		 * @returns {Object}
		 *
		 * @override
		 */
		setValue: function (value) {
			return this.callParent([this.delegate.cmfg('fieldDisplayReferenceValueSet', value)]);
		}
	});

})();
