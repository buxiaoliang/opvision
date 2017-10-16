(function () {

	Ext.define('CMDBuild.override.form.FieldContainer', {
		override: 'Ext.form.FieldContainer',

		/**
		 * @cfg {String}
		 */
		name: undefined,

		/**
		 * Implementation of getName method used from FormFunctions class 12/09/2016
		 *
		 * @returns {String}
		 */
		getName: function () {
			return this.name;
		}
	});

})();
