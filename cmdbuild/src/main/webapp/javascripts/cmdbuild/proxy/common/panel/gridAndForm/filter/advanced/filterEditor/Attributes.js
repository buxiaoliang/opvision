(function () {

	/**
	 * @link CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.filterEditor.Attributes
	 */
	Ext.define('CMDBuild.proxy.common.panel.gridAndForm.filter.advanced.filterEditor.Attributes', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attribute.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ATTRIBUTE, parameters);
		}
	});

})();
