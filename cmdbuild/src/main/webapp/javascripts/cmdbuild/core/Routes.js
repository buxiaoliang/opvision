(function () {

	Ext.define('CMDBuild.core.Routes', {

		/**
		 * @property {String}
		 *
		 * @private
		 */
		route: undefined,

		/**
		 * @param {Object} configurationObject
		 *
		 * @returns {Void}
		 */
		constructor: function (configurationObject) {
			Ext.apply(this, configurationObject);

			// Setup global reference
			Ext.ns('CMDBuild.global');
			CMDBuild.global.Routes = this;
		},

		/**
		 * @returns {Void}
		 */
		exec: function () {
			if (!this.isRoutePathEmpty()) {
				var route = this.route;

				delete this.route;

				Ext.Router.parse('exec/' + route);
			}
		},

		/**
		 * @returns {Boolean}
		 */
		isRoutePathEmpty: function () {
			return !Ext.isString(this.route) || Ext.isEmpty(this.route);
		},

		/**
		 * @param {String} path
		 *
		 * @returns {Void}
		 */
		setRoutePath: function (path) {
			if (Ext.isString(path) && !Ext.isEmpty(path))
				this.route = path;
		}
	});

})();
