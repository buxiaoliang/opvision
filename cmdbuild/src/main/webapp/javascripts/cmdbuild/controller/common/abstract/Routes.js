(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.abstract.Routes', {
		extend: 'Ext.app.Controller',

		/**
		 * @param {Object} params
		 *
		 * @returns {Boolean}
		 *
		 * @abstract
		 */
		paramsValidation: function (params) {
			return true;
		},

		/**
		 * @param {Object} params - url parameters
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		saveRoute: function (params, path, router) {
			CMDBuild.global.Routes.setRoutePath(path);
		}
	});

})();
