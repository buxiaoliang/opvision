(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.constants.WidgetType'
	]);

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.management.widget.openNote.Configuration', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ALWAYS_ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string', defaultValue: CMDBuild.core.constants.WidgetType.getOpenNote() }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.ALWAYS_ENABLED] = data['alwaysenabled'];

			this.callParent(arguments);
		}
	});

})();
