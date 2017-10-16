(function () {

	/**
	 * Module's identifiers used to get module controllers and accordions
	 */
	Ext.define('CMDBuild.core.constants.ModuleIdentifiers', {

		singleton: true,

		/**
		 * @cfg {Object}
		 *
		 * @private
		 */
		config: {
			classes: 'class',
			configuration: 'configuration',
			customPage: 'custompage',
			dataView: 'dataview',
			domain: 'domain',
			email: 'email',
			filter: 'filter',
			localization: 'localization',
			lookupType: 'lookuptype',
			menu: 'menu',
			navigation: 'navigation',
			navigationTree: 'navigationtree',
			report: 'report',
			reportSingle: 'reportsingle',
			taskManager: 'taskManager',
			userAndGroup: 'userandgroup',
			utility: 'utility',
			workflow: 'workflow'
		},

		/**
		 * @param {Object} config
		 *
		 * @returns {Void}
		 */
		constructor: function (config) {
			this.initConfig(config);
		}
	});

})();
