(function () {

	/**
	 * Traffic light class with multiple instances support (id parameter)
	 */
	Ext.define('CMDBuild.core.RequestBarrier', {

		/**
		 * @property {Object} - CMDBuild.model.core.Barrier
		 *
		 * @private
		 */
		buffer: {},

		/**
		 * @cfg {Boolean}
		 */
		enableCallbackExecution: false,

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.executionTimeout
		 * @param {Function} parameters.failure
		 * @param {String} parameters.id
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		constructor: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.executionTimeout = Ext.isNumber(parameters.executionTimeout) ? parameters.executionTimeout : 5000;

			// Error handling
				if (!Ext.isString(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('constructor(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			this.barrierBufferSet({
				id: parameters.id,
				callback: parameters.callback,
				scope: parameters.scope
			});

			// Failure defered function initialization
			if (Ext.isFunction(parameters.failure))
				Ext.defer(function () {
					if (!this.barrierBufferIsEmpty(parameters.id))
						Ext.callback(
							this.barrierBufferGet({
								id: parameters.id,
								property: CMDBuild.core.constants.Proxy.FAILURE
							}),
							this.barrierBufferGet({
								id: parameters.id,
								property: CMDBuild.core.constants.Proxy.SCOPE
							})
						);
				}, parameters.executionTimeout, this);
		},

		// Buffer manage methods
			/**
			 * @param {Object} parameters
			 * @param {String} parameters.id
			 * @param {String} parameters.property
			 *
			 * @returns {Mixed or null}
			 *
			 * @private
			 */
			barrierBufferGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.property = Ext.isString(parameters.property) ? parameters.property : null;

				// Error handling
					if (!Ext.isString(parameters.id) || Ext.isEmpty(parameters.id))
						return _error('barrierBufferGet(): unmanaged id parameter', this, parameters.id);
				// END: Error handling

				if (Ext.isObject(this.buffer[parameters.id]) && !Ext.Object.isEmpty(this.buffer[parameters.id])) {
					if (Ext.isString(parameters.property) && !Ext.isEmpty(parameters.property))
						return this.buffer[parameters.id].get(parameters.property);

					return this.buffer[parameters.id];
				}

				return null;
			},

			/**
			 * @param {String} id
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			barrierBufferIsEmpty: function (id) {
				// Error handling
					if (!Ext.isString(id) || Ext.isEmpty(id))
						return _error('barrierBufferIsEmpty(): unmanaged id parameter', this, id);
				// END: Error handling

				return Ext.isObject(this.buffer[id]) && Ext.Object.isEmpty(this.buffer[id]);
			},

			/**
			 * @param {Object} parameters
			 * @param {String} parameters.action - [inc, dec]
			 * @param {String} parameters.id
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			barrierBufferManageIndex: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.action = Ext.isString(parameters.action) ? parameters.action : 'increase';

				// Error handling
					if (!Ext.isString(parameters.id) || Ext.isEmpty(parameters.id))
						return _error('barrierBufferManageIndex(): unmanaged id parameter', this, parameters.id);
				// END: Error handling

				if (Ext.isObject(this.buffer[parameters.id]) && !Ext.Object.isEmpty(this.buffer[parameters.id]))
					switch (parameters.action) {
						case 'dec':
							return this.buffer[parameters.id].set(
								CMDBuild.core.constants.Proxy.INDEX,
								this.buffer[parameters.id].get(CMDBuild.core.constants.Proxy.INDEX) - 1
							);

						case 'inc':
							return this.buffer[parameters.id].set(
								CMDBuild.core.constants.Proxy.INDEX,
								this.buffer[parameters.id].get(CMDBuild.core.constants.Proxy.INDEX) + 1
							);

						default:
							return _error('barrierBufferManageIndex(): unmanaged action parameter', this, parameters.action);
					}
			},

			/**
			 * @param {String} id
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			barrierBufferRemove: function (id) {
				// Error handling
					if (!Ext.isString(id) || Ext.isEmpty(id))
						return _error('barrierBufferDelete(): unmanaged id parameter', this, id);
				// END: Error handling

				if (Ext.isObject(this.buffer[id]) && !Ext.Object.isEmpty(this.buffer[id]))
					return delete this.buffer[id];

				return;
			},

			/**
			 * @param {Object} parameters
			 * @param {Function} parameters.callback
			 * @param {String} parameters.id
			 * @param {Object} parameters.scope
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			barrierBufferSet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
				parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

				// Error handling
					if (!Ext.isString(parameters.id) || Ext.isEmpty(parameters.id))
						return _error('barrierBufferGet(): unmanaged id parameter', this, parameters.id);
				// END: Error handling

				var bufferObject = {};
				bufferObject[CMDBuild.core.constants.Proxy.CALLBACK] = parameters.callback;
				bufferObject[CMDBuild.core.constants.Proxy.SCOPE] = parameters.scope;

				this.buffer[parameters.id] = Ext.create('CMDBuild.model.core.Barrier', bufferObject);
			},

		/**
		 * @param {String} id
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		callback: function (id) {
			// Error handling
				if (!Ext.isString(id) || Ext.isEmpty(id))
					return _error('callback(): unmanaged id parameter', this, id);
			// END: Error handling

			if (!this.barrierBufferIsEmpty(id)) {
				this.barrierBufferManageIndex({
					action: 'dec',
					id: id
				});

				this.finalize(id);
			}
		},

		/**
		 * Check callback index and launch last callback but only if enableCallbackExecution parameter is set to true (avoids problems on configurations without delay)
		 * EnableCallbackExecution must be set to true only on last finalize call before barrier setup
		 *
		 * @param {String} id
		 * @param {Boolean} enableCallbackExecution
		 *
		 * @returns {Void}
		 */
		finalize: function (id, enableCallbackExecution) {
			// Error handling
				if (!Ext.isString(id) || Ext.isEmpty(id))
					return _error('finalize(): unmanaged id parameter', this, id);
			// END: Error handling

			if (!this.enableCallbackExecution) // IMPORTANT: this parameter must not be overridden every call to avoid problems on configurations with delay
				this.enableCallbackExecution = Ext.isBoolean(enableCallbackExecution) ? enableCallbackExecution : false;

			if (
				!this.barrierBufferIsEmpty(id)
				&& this.barrierBufferGet({
					id: id,
					property: CMDBuild.core.constants.Proxy.INDEX
				}) == 0
				&& this.enableCallbackExecution
			) {
				Ext.callback(
					this.barrierBufferGet({
						id: id,
						property: CMDBuild.core.constants.Proxy.CALLBACK
					}),
					this.barrierBufferGet({
						id: id,
						property: CMDBuild.core.constants.Proxy.SCOPE
					})
				);

				this.barrierBufferRemove(id); // Buffer reset
			}
		},

		/**
		 * @param {String} id
		 *
		 * @returns {Function}
		 */
		getCallback: function (id) {
			// Error handling
				if (!Ext.isString(id) || Ext.isEmpty(id))
					return _error('getCallback(): unmanaged id parameter', this, id);
			// END: Error handling

			if (!this.barrierBufferIsEmpty(id)) {
				this.barrierBufferManageIndex({
					action: 'inc',
					id: id
				});

				return Ext.bind(this.callback, this, [id]);
			}
		}
	});

})();
