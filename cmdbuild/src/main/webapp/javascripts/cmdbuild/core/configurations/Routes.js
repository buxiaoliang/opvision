(function () {

	Ext.define('CMDBuild.core.configurations.Routes', {

		singleton: true,

		config: {
			simpleFilterSeparator: '~'
		},

		/**
		 * @param {Object} config
		 *
		 * @returns {Void}
		 */
		constructor: function(config) {
			this.initConfig(config);
		}
	});

})();
