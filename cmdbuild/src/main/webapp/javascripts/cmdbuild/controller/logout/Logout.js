(function () {

	Ext.define('CMDBuild.controller.logout.Logout', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.CookiesManager',
			'CMDBuild.proxy.Session'
		],

		/**
		 * @param {Object} configurationObject
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.sessionRemove();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		sessionRemove: function () {
			var logoutRedirect = Ext.String.trim(CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.LOGOUT_REDIRECT));
			logoutRedirect = Ext.isEmpty(logoutRedirect) ? 'index.jsp' : logoutRedirect;

			if (!CMDBuild.core.CookiesManager.authorizationIsEmpty()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.SESSION] = CMDBuild.core.CookiesManager.authorizationGet();

				CMDBuild.proxy.Session.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						CMDBuild.core.CookiesManager.authorizationClear();

						window.location = logoutRedirect;
					}
				});
			} else {
				window.location = logoutRedirect;
			}
		}
	});

})();
