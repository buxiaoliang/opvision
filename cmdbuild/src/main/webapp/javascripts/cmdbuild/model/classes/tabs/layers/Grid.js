(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link GISLayerModel
	 */
	Ext.define('CMDBuild.model.classes.tabs.layers.Grid', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FULL_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.INDEX, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.IS_VISIBLE, type: 'boolean' }, // Just for grid column rendering
			{ name: CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MAX_ZOOM, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.MIN_ZOOM, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.VISIBILITY, type: 'auto', defaultValue: [] }
		],

		/**
		 * @param {String} name
		 *
		 * @returns {Boolean}
		 */
		isVisibleForEntryType: function (name) {
			if (Ext.isString(name) && !Ext.isEmpty(name))
				return Ext.Array.contains(this.get(CMDBuild.core.constants.Proxy.VISIBILITY), name);

			return false;
		}
	});
})();
