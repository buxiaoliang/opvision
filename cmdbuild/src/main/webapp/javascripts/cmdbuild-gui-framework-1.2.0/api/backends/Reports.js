(function($) {
	
	/**
	 * @param {Object} params
	 * @param {Function} onReadyFunction
	 * @param {DOM} onReadScope
	 */
	var Reports = function(params, onReadyFunction, onReadyScope) {
		/*
		 * ATTRIBUTES
		 */
		this.data = [];
		this.metadata = {};

		/*
		 * PRIVATE ATTRIBUTES
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/*
		 * BASE FUNCTIONS
		 */
		/** 
		 * Initialize
		 */
		this.init = function() {
			setTimeout(onObjectReady, 500);
		};
		/**
		 * Load data
		 * @param {Object} params
		 * @param {Integer} params.limit
		 * @param {Integer} params.start
		 * @param {String} params.searchTherm
		 * @param {Function} callback
		 * @param {DOM} scope
		 */
		this.loadData = function(params, callback, scope) {
			var me = this;
			var requestparams = {
				limit : params.limit,
				start : params.start,
				sort : params.sort
			};

			// search therm
			if (params.searchTherm) {
				requestparams.filter = {query : params.searchTherm}
			}

			$.Cmdbuild.utilities.proxy.getReports(requestparams, function(data, metadata) {
				me.data = data;
				me.metadata = metadata;
				callback.apply(scope, [data, metadata]);
			}, me);
		}

		/*
		 * GETTERS
		 */
		/**
		 * Get data
		 * @return {Array}
		 */
		this.getData = function() {
			return this.data;
		}
		/**
		 * Get single report info
		 * 
		 * @param {Numeric} id
		 * @param {Function} callback
		 * @param {DOM} scope
		 */
		this.getReportInfo = function(id, callaback, scope) {
			$.Cmdbuild.utilities.proxy.getReport(id, callaback, scope);
		}

		/**
		 * Get meta-data
		 * @return {Object}
		 */
		this.getMetadata = function() {
			return this.metadata;
		}

		/*
		 * SETTERS
		 */
		

		/*
		 * PRIVATE FUNCTIONS
		 */
		function onObjectReady() {
			onReadyFunction.apply(onReadyScope);
		};

		/*
		 * CUSTOM FUNCTIONS
		 */
		

		/*
		 * Call init function and return object
		 */
		this.init();
	};

	$.Cmdbuild.standard.backend.Reports = Reports;
})(jQuery);