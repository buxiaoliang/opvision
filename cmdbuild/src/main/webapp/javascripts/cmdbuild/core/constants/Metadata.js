(function () {

	/**
	 * Managed metadata names
	 */
	Ext.define('CMDBuild.core.constants.Metadata', {

		singleton: true,

		/**
		 * @cfg {Object}
		 *
		 * @private
		 */
		config: {
			activitySubsetId: 'ActivitySubsetId', // Workflow
			additionalActivityLabel: 'AdditionalActivityLabel', // Workflow
			nextActivitySubsetId: 'NextActivitySubsetId', // Workflow
			selectedAttributesGroup: 'SelectedAttributesGroup' // Workflow
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
