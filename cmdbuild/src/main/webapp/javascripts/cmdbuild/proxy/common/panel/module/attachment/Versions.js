(function () {

	Ext.define('CMDBuild.proxy.common.panel.module.attachment.Versions', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.common.panel.module.attachment.Attachment',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.UNCACHED, { // Uncached because update doesn't go through cache component
				autoLoad: false,
				model: 'CMDBuild.model.common.panel.module.attachment.Attachment',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.attachment.getVersions,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE
					},
					extraParams: { // Avoid to send limit, page and start parameters in server calls
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.VERSION, direction: 'DESC' }
				]
			});
		}
	});

})();
