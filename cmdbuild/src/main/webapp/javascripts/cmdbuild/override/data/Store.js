(function () {

	Ext.require([
		'CMDBuild.core.interfaces.messages.Error',
		'CMDBuild.core.interfaces.messages.Warning',
		'CMDBuild.core.Message'
	]);

	Ext.define('CMDBuild.override.data.Store', {
		override: 'Ext.data.Store',

		/**
		 * Custom load method implementation 19/01/2017
		 *
		 * @returns {Void}
		 */
		customLoadMethod: function () {
			this.load();
		},

		/**
		 * Custom load method implementation 19/01/2017
		 *
		 * @param {Number} pageNum
		 *
		 * @returns {Void}
		 */
		customLoadPageMethod: function (pageNum) {
			this.loadPage(pageNum);
		},

		/**
		 * Custom load method implementation 19/01/2017
		 *
		 * @param {Function} sorterFn
		 *
		 * @returns {Void}
		 *
		 * @override
		 * @private
		 */
		doSort: function (sorterFn) {
			var range,
				ln,
				i;

			if (this.remoteSort) {
				// For a buffered Store, we have to clear the prefetch cache since it is keyed by the index within the dataset.
				// Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store via the guaranteedrange event
				if (this.buffered) {
					this.data.clear();

					this.customLoadPageMethod(1);
				} else {
					// the load function will pick up the new sorters and request the sorted data from the proxy
					this.customLoadMethod();
				}
			} else {
				// <debug>
				if (this.buffered)
					Ext.Error.raise({ msg: 'Local sorting may not be used on a buffered store' });
				// </debug>

				this.data.sortBy(sorterFn);

				if (!this.buffered) {
					range = this.getRange();
					ln = range.length;

					for (i = 0; i < ln; i++)
						range[i].index = i;
				}

				this.fireEvent('datachanged', this);
				this.fireEvent('refresh', this);
			}
		},

		/**
		 * Creates callback interceptor to print error message on store load - 02/10/2015
		 *
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
		 * Creates callback interceptor to print error message on store load - 02/10/2015
		 *
		 * @param {Object} options
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		load: function (options) {
			if (!Ext.isEmpty(CMDBuild.global) && !Ext.isEmpty(CMDBuild.global.Data))
				CMDBuild.global.Data.dataDefaultHeadersUpdate();

			if (!Ext.isEmpty(options)) {
				options.callback = Ext.isEmpty(options.callback) || !Ext.isFunction(options.callback) ? Ext.emptyFn : options.callback;
				options.callback = Ext.Function.createInterceptor(options.callback, this.interceptorFunction, this);
			}

			this.callParent(arguments);
		}
	});

})();
