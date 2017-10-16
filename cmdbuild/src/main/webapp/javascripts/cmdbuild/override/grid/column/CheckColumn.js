(function () {

	Ext.define('CMDBuild.override.grid.column.CheckColumn', {
		override: 'Ext.grid.column.CheckColumn',

		/**
		 * @cfg {Boolean}
		 */
		enableCheckboxHide: false,

		/**
		 * 23/06/2016
		 *
		 * @property {Object} value
		 * @property {Object} metaData
		 * @property {Ext.data.Model} record
		 * @property {Number} rowIndex
		 * @property {Number} colIndex
		 * @property {Ext.data.Store} store
		 * @property {Ext.view.View} view
		 *
		 * @returns {String}
		 *
		 * @override
		 */
		renderer: function (value, meta, record, rowIndex, colIndex, store, view) {
			if (
				Ext.isBoolean(this.enableCheckboxHide) && this.enableCheckboxHide
				&& Ext.isFunction(this.isCheckboxHidden) && this.isCheckboxHidden(value, meta, record, rowIndex, colIndex, store, view)
			) {
				return '';
			}

			return this.callParent(arguments);
		},

		/**
		 * Enabled only if enableCheckboxHide is true 23/06/2016
		 *
		 * @property {Object} value
		 * @property {Object} metaData
		 * @property {Ext.data.Model} record
		 * @property {Number} rowIndex
		 * @property {Number} colIndex
		 * @property {Ext.data.Store} store
		 * @property {Ext.view.View} view
		 *
		 * @returns {Boolean}
		 *
		 * @override
		 */
		isCheckboxHidden: function (value, meta, record, rowIndex, colIndex, store, view) {
			return false;
		}
	});

})();
