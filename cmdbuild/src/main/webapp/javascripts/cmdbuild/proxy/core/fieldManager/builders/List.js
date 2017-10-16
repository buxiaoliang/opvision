(function () {

	Ext.define('CMDBuild.proxy.core.fieldManager.builders.List', {

		requires: ['CMDBuild.core.constants.Proxy'],

		singleton: true,

		/**
		 * @param {Array} values
		 *
		 * @returns {Ext.data.ArrayStore}
		 */
		getStore: function (values) {
			values = Ext.isArray(values) ? Ext.Array.clean(values) : Ext.Array.clean([values]);

			var adaptedArray = [];

			// Adapter function
			Ext.Array.forEach(values, function (value, i, allValues) {
				if (Ext.isObject(value) && !Ext.Object.isEmpty(value))
					return adaptedArray.push([value[CMDBuild.core.constants.Proxy.DESCRIPTION], value[CMDBuild.core.constants.Proxy.ID]]);

				return adaptedArray.push([value, value]);
			}, this);

			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.ID, CMDBuild.core.constants.Proxy.DESCRIPTION],
				data: adaptedArray
			});
		}
	});

})();
