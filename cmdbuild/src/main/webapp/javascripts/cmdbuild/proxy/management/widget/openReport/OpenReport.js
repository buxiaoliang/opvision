(function () {

	Ext.define('CMDBuild.proxy.management.widget.openReport.OpenReport', {

		requires: [
			'CMDBuild.core.configurations.Timeout',
			'CMDBuild.core.constants.Proxy',
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
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		createFactory: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				timeout: CMDBuild.core.configurations.Timeout.getReport(),
				url: CMDBuild.proxy.index.Json.report.factory.createByTypeCode
			});

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreFormats: function () {
			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.VALUE, CMDBuild.core.constants.Proxy.DESCRIPTION],
				data: [
					[CMDBuild.core.constants.Proxy.PDF, CMDBuild.Translation.pdf],
					[CMDBuild.core.constants.Proxy.CSV, CMDBuild.Translation.csv],
					[CMDBuild.core.constants.Proxy.ODT, CMDBuild.Translation.odt],
					[CMDBuild.core.constants.Proxy.RTF, CMDBuild.Translation.rtf]
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				timeout: CMDBuild.core.configurations.Timeout.getReport(),
				url: CMDBuild.proxy.index.Json.report.factory.updateParams
			});

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		}
	});

})();
