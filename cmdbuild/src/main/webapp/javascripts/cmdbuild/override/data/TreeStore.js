(function () {

	Ext.require([
		'CMDBuild.core.interfaces.messages.Error',
		'CMDBuild.core.interfaces.messages.Warning',
		'CMDBuild.core.Message'
	]);

	Ext.define('CMDBuild.override.data.TreeStore', {
		override: 'Ext.data.TreeStore',

		/**
		 * @cfg {Boolean}
		 */
		clearOnPageLoad: true,

		/**
		 * @cfg {Number}
		 */
		currentPage: 1,

		/**
		 * @cfg {Number}
		 */
		pageSize: undefined,

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @returns {Number}
		 */
		getCount: function() {
			return this.tree.getRootNode().childNodes.length || 0;
		},

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @returns {Number}
		 */
		getTotalCount: function () {
			return this.totalCount || 0;
		},

		/**
		 * @param {Array} records
		 * @param {Ext.data.Operation} operation
		 * @param {Boolean} success
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		interceptorFunction: function (records, operation, success) {
			var decodedResponse = undefined;

			if (!success) {
				if (
					!Ext.isEmpty(operation)
					&& !Ext.isEmpty(operation.response)
					&& !Ext.isEmpty(operation.response.responseText)
				) {
					decodedResponse = Ext.decode(operation.response.responseText);
				}

				if (!CMDBuild.global.interfaces.Configurations.get('disableAllMessages')) {
					if (!CMDBuild.global.interfaces.Configurations.get('disableWarnings'))
						CMDBuild.core.interfaces.messages.Warning.display(decodedResponse);

					if (!CMDBuild.global.interfaces.Configurations.get('disableErrors'))
						CMDBuild.core.interfaces.messages.Error.display(decodedResponse, operation.request);
				}
			}

			return true;
		},

		/**
		 * @param {Object} options
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		load: function (options) {
			options = options || {};
			options.params = options.params || {};
			options.node = options.node || this.tree.getRootNode();

			options.params[this.proxy.limitParam] = options[this.proxy.limitParam] || this.pageSize
			options.params[this.proxy.pageParam] = options[this.proxy.pageParam] || this.currentPage
			options.params[this.nodeParam] = options.node ? options.node.getId() : 'root';

			// Creates callback interceptor to print error message on store load - 02/10/2015
			if (!Ext.isEmpty(options)) {
				options.callback = Ext.isEmpty(options.callback) || !Ext.isFunction(options.callback) ? Ext.emptyFn : options.callback;
				options.callback = Ext.Function.createInterceptor(options.callback, this.interceptorFunction, this);
			}

			this.callParent(arguments);
		},

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @param {Number} page
		 * @param {Object} options
		 *
		 * @returns {Void}
		 */
		loadPage: function (page, options) {
			page = Ext.isNumber(page) ? page : 1;
			options = Ext.isObject(options) ? options : {};

			this.currentPage = page;

			this.read(Ext.applyIf(options, {
				page: page,
				start: (page - 1) * this.pageSize,
				limit: this.pageSize,
				addRecords: !this.clearOnPageLoad
			}));
		},

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @param {Object} options
		 *
		 * @returns {Void}
		 */
		nextPage: function (options) {
			this.loadPage(this.currentPage + 1, options);
		},

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @param {Ext.data.Operation} operation
		 *
		 * @returns {Void}
		 */
		onProxyLoad: function (operation) {
			var resultSet = operation.getResultSet();
			var decodedResponse = undefined;

			if (
				!Ext.isEmpty(operation)
				&& !Ext.isEmpty(operation.response)
				&& !Ext.isEmpty(operation.response.responseText)
			) {
				decodedResponse = Ext.decode(operation.response.responseText);
			}

			// Correctly setup total store record counts
			if (
				operation.success
				&& resultSet
				&& !Ext.isEmpty(this.proxy)
				&& !Ext.isEmpty(this.proxy.reader)
				&& !Ext.isEmpty(this.proxy.reader.totalProperty)
				&& Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)
			) {
				resultSet.total = decodedResponse.response[this.proxy.reader.totalProperty];
				resultSet.totalRecords = decodedResponse.response[this.proxy.reader.totalProperty];

				this.totalCount = resultSet.total;
			}

			this.callParent(arguments);
		},

		/**
		 * Implementation to use paging bar in tree 30/06/2016
		 *
		 * @param {Object} options
		 *
		 * @returns {Void}
		 */
		previousPage: function (options) {
			this.loadPage(this.currentPage - 1, options);
		}
	});

})();
