(function () {

	/**
	 * Applied attributes translations:
	 * 	- Base params
	 * 		text -> description
	 *
	 * 	- Permissions
	 * 		priv_create -> create
	 * 		priv_write -> write
	 */
	Ext.define('CMDBuild.proxy.utility.importCsv.ReaderClasses', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.classstore',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @param {Object} rowObject
		 *
		 * @returns {Object or null} rowNewObject
		 *
		 * @private
		 */
		buildRecord: function (rowObject) {
			if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)) {
				var rowNewObject = {};

				// Base attributes
				rowNewObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rowObject[CMDBuild.core.constants.Proxy.TEXT];
				rowNewObject[CMDBuild.core.constants.Proxy.ID] = rowObject[CMDBuild.core.constants.Proxy.ID];
				rowNewObject[CMDBuild.core.constants.Proxy.NAME] = rowObject[CMDBuild.core.constants.Proxy.NAME];

				// Permissions object
				var permissions = {};
				permissions[CMDBuild.core.constants.Proxy.CREATE] = rowObject['priv_create'];
				permissions[CMDBuild.core.constants.Proxy.WRITE] = rowObject['priv_write'];

				rowNewObject[CMDBuild.core.constants.Proxy.PERMISSIONS] = permissions;

				return rowNewObject;
			}

			return null;
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Ext.data.ResultSet}
		 *
		 * @override
		 */
		readRecords: function (data) {
			var structure = [];

			if (Ext.isArray(data[this.root]) && !Ext.isEmpty(data[this.root]))
				Ext.Array.each(data[this.root], function (rowObject, i, allRowObjects) {
					structure.push(this.buildRecord(rowObject));
				}, this);

			var decodedItems = {};
			decodedItems[this.root] = Ext.Array.clean(structure);

			Ext.apply(data, decodedItems); // Override row property with custom ones

			return this.callParent(arguments);
		}
	});

})();
