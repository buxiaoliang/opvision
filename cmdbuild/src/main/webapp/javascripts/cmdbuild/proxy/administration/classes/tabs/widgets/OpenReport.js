(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.widgets.OpenReport', {

		requires: [
			'CMDBuild.core.configurations.Timeout',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.classes.tabs.widgets.openReport.ReportCombo',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		create: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				timeout: CMDBuild.core.configurations.Timeout.getReport(),
				url: CMDBuild.proxy.index.Json.report.factory.create
			});

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.REPORT, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.classes.tabs.widgets.openReport.ReportCombo',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.report.readByType,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ROWS,
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					},
					extraParams: {
						type: CMDBuild.core.constants.Proxy.CUSTOM
					}
				},
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreForceFormat: function () {
			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.VALUE, CMDBuild.core.constants.Proxy.DESCRIPTION],
				data: [
					[CMDBuild.core.constants.Proxy.PDF, CMDBuild.Translation.pdf],
					[CMDBuild.core.constants.Proxy.CSV, CMDBuild.Translation.csv]
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		}
	});

})();
