(function() {

	Ext.define('CMDBuild.view.management.classes.map.proxy.NavigationTree', {

		uses : [ 'CMDBuild.core.constants.Proxy', 'CMDBuild.proxy.index.Json' ],

		singleton : true,

		/**
		 * @param {Object}
		 *            parameters
		 *
		 * @returns {Void}
		 */
		read : function(parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;
			Ext.apply(parameters, {
				loadMask: false,
				url : CMDBuild.proxy.index.Json.gis.getGISTreeNavigation
			});

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		}
	});

})();
