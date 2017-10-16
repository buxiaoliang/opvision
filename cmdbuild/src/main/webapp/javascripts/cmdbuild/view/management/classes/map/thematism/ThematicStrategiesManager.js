(function() {

	Ext.define("CMDBuild.view.management.classes.map.thematism.ThematicStrategiesManager", {
		requires : [ "CMDBuild.view.management.classes.map.proxy.Functions" ],

		/**
		 * loaded function strategies; can be used only after a call of
		 * getFunctionStrategies on the class
		 */
		functionStrategies : undefined,

		/**
		 * Custom client functions
		 */
		strategies : {
			valueData : {
				description : CMDBuild.Translation.value,

				/**
				 * @param {Object}
				 *            parameters
				 *
				 * @returns {generic value}
				 */
				value : function(parameters, callback, callbackScope) {
					var value = parameters.card[parameters.attributeName];
					if (typeof value === "object") {
						value = value.description;
					}
					return value;
				}
			}
		},

		/**
		 * Custom client functions
		 *
		 * @returns {Array}
		 */
		getFieldStrategies : function(callback, callbackScope) {
			callback.apply(callbackScope, [ this.strategies ]);
		},

		/**
		 * Custom Sql functions
		 */
		getFunctionStrategies : function(callback, callbackScope) {
			var params = {
				detailed : true
			};
			CMDBuild.view.management.classes.map.proxy.Functions.readAllFunctions({
				scope : this,
				params : params,
				success : function(response, options, decodedResponse) {
					this.functionStrategies = decodedResponse[CMDBuild.core.constants.Proxy.DATA];
					this.completeStrategyByStrategy(this.functionStrategies, 0, function() {
						callback.apply(callbackScope, [ this.functionStrategies ]);
					}, this);
				}
			});
		},

		getStrategyByDescription : function(description) {
			for ( var key in this.strategies) {
				if (this.strategies[key].description === description) {
					return this.strategies[key];
				}
			}
			for (var i = 0; this.functionStrategies && i < this.functionStrategies.length; i++) {
				if (this.functionStrategies[i].description === description) {
					return this.functionStrategies[i];
				}
			}
			return null;
		},

		/**
		 * @param {Object}
		 *            parameters
		 *
		 * @returns {generic value}
		 */
		value4Function : function(parameters) {
			return parameters.card;
		},
		/**
		 * @param {Object}
		 *            parameters
		 *
		 * @returns {generic value}
		 */
		functionValue : function(parameters, callback, callbackScope) {
			var params = {
				parameters : Ext.encode({
					ClassName : parameters.className
				})
			};

			CMDBuild.view.management.classes.map.proxy.Functions.readOutput({
				scope : this,
				_id : parameters.strategy._id,
				params : params,
				success : function(response, options, decodedResponse) {
					callback.apply(callbackScope, [ decodedResponse.data ]);
				}
			});
		},

		/**
		 * @param {Array}
		 *            strategies
		 *
		 * @returns {Mixed}
		 */
		completeStrategyByStrategy : function(strategies, index, callback, callbackScope) {
			if (index >= strategies.length) {
				callback.apply(callbackScope, []);
				return;
			}
			var strategy = strategies[index];
			CMDBuild.view.management.classes.map.proxy.Functions.readAttributes({
				scope : this,
				_id : strategy._id,
				success : function(response, options, decodedResponse) {
					var attributes = decodedResponse[CMDBuild.core.constants.Proxy.DATA];
					strategy.attributes = attributes;
					this.completeOneStrategy(strategy, function() {
						this.completeStrategyByStrategy(strategies, index + 1, function() {
							callback.apply(callbackScope, []);
						}, this);
					}, this);
				}
			});
		},

		/**
		 * @param {Object}
		 *            strategy
		 *
		 * @returns {Void}
		 */
		completeOneStrategy : function(strategy, callback, callbackScope) {
			strategy.value = this.value4Function;
			CMDBuild.view.management.classes.map.proxy.Functions.readParameters({
				scope : this,
				_id : strategy._id,
				success : function(response, options, decodedResponse) {
					var parameters = decodedResponse[CMDBuild.core.constants.Proxy.DATA];
					strategy.parameters = parameters;
					callback.apply(callbackScope, []);
				}
			});
		}
	});

})();
