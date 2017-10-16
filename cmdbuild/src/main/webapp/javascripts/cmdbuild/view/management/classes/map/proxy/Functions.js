(function() {

	/**
	 * REST proxy
	 * 
	 * FIXME: Waiting for a place in rest proxies
	 */
	Ext.define('CMDBuild.view.management.classes.map.proxy.Functions', {

		requires : [ 'CMDBuild.core.constants.Proxy', 'CMDBuild.core.interfaces.Rest', 'CMDBuild.proxy.index.Rest' ],

		singleton : true,

		/**
		 * @param {Object}
		 *            parameters
		 * 
		 * @returns {Void}
		 */
		readAllFunctions : function(parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				method : 'GET',
				url : CMDBuild.proxy.index.Rest.functions + '/'
			});

			CMDBuild.core.interfaces.Rest.request(parameters);
		},

		/**
		 * @param {Object}
		 *            parameters
		 * 
		 * @returns {Void}
		 */
		readAttributes : function(parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				method : 'GET',
				url : CMDBuild.proxy.index.Rest.functions + '/' + parameters._id + '/attributes/'
			});

			CMDBuild.core.interfaces.Rest.request(parameters);
		},
		/**
		 * @param {Object}
		 *            parameters
		 * 
		 * @returns {Void}
		 */
		readParameters : function(parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				method : 'GET',
				url : CMDBuild.proxy.index.Rest.functions + '/' + parameters._id + '/parameters/'
			});

			CMDBuild.core.interfaces.Rest.request(parameters);
		},

		/**
		 * @param {Object}
		 *            parameters
		 * 
		 * @returns {Void}
		 */
		readOutput : function(parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, {
				method : 'GET',
				url : CMDBuild.proxy.index.Rest.functions + '/' + parameters._id + '/outputs/'
			});

			CMDBuild.core.interfaces.Rest.request(parameters);
		}
	});

})();
