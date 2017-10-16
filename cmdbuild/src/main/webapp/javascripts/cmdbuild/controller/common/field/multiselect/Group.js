(function () {

	Ext.define('CMDBuild.controller.common.field.multiselect.Group', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldMultiselectGroupReset',
			'fieldMultiselectGroupStoreGet',
			'fieldMultiselectGroupSelectAll',
			'fieldMultiselectGroupValueGet'
		],

		/**
		 * @property {CMDBuild.view.common.field.multiselect.Group}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 */
		fieldMultiselectGroupReset: function () {
			this.view.setValue();
		},

		/**
		 * Forwarder method
		 *
		 * @returns {Ext.data.Store}
		 */
		fieldMultiselectGroupStoreGet: function () {
			return this.view.boundList.getStore();
		},

		/**
		 * @returns {Void}
		 */
		fieldMultiselectGroupSelectAll: function () {
			var arrayGroups = [];

			Ext.Array.forEach(this.view.getStore().getRange(), function (record, i, allRecords) {
				if (Ext.isObject(record) && !Ext.Object.isEmpty(record) && Ext.isFunction(record.get))
					arrayGroups.push(record.get(CMDBuild.core.constants.Proxy.NAME));
			}, this);

			this.view.setValue(arrayGroups);
		},

		/**
		 * @param {Array} value
		 *
		 * @returns {Array}
		 */
		fieldMultiselectGroupValueGet: function (value) {
			return Ext.isArray(value) ? Ext.Array.clean(value) : [];
		}
	});

})();
