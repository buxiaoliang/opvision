(function () {

	/**
	 * Applied attributes translations:
	 *  - Description -> description
	 *  - Id -> id
	 *  - Number -> number
	 */
	Ext.define('CMDBuild.proxy.common.panel.module.attachment.reader.Lookup', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.lookupstore',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @param {Object} rowObject
		 *
		 * @returns {Object} rowObject
		 *
		 * @private
		 */
		buildRow: function (rowObject) {
			if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject)) {
				rowObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rowObject['Description'];
				rowObject[CMDBuild.core.constants.Proxy.ID] = rowObject['Id'];
				rowObject[CMDBuild.core.constants.Proxy.NUMBER] = rowObject['Number'];
			}

			return rowObject;
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Ext.data.ResultSet}
		 *
		 * @override
		 */
		readRecords: function (data) {
			data = data[this.root];

			var structure = [];

			if (Ext.isArray(data) && !Ext.isEmpty(data))
				Ext.Array.forEach(data, function (rowObject, i, allRowObjects) {
					if (Ext.isObject(rowObject) && !Ext.Object.isEmpty(rowObject))
						structure.push(this.buildRow(rowObject));
				}, this);

			return this.callParent([structure]);
		}
	});

})();
