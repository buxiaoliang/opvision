(function () {

	Ext.define('CMDBuild.view.common.field.display.Boolean', {
		extend: 'Ext.form.field.Display',

		requires: ['CMDBuild.core.Utils'],

		/**
		 * @param {String} value
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		setRawValue: function (value) {
			value = CMDBuild.core.Utils.decodeAsBoolean(value);
			value = value ? CMDBuild.Translation.yes : CMDBuild.Translation.no;

			if (this.htmlEncode)
				value = Ext.util.Format.htmlEncode(value);

			this.callParent(arguments);
		}
	});

})();
