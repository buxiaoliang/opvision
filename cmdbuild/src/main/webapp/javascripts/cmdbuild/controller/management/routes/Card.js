(function () {

	Ext.define('CMDBuild.controller.management.routes.Card', {
		extend: 'CMDBuild.controller.common.abstract.Routes',

		requires: [
			'CMDBuild.core.configurations.Routes',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.routes.Card'
		],

		/**
		 * @property {CMDBuild.model.management.routes.Card}
		 *
		 * @private
		 */
		paramsModel: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		supportedPrintFormats: [
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.CSV
		],

		/**
		 * @param {Object} params
		 * @param {String} params.classIdentifier
		 * @param {String} params.clientFilter
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 */
		detail: function (params, path, router) {
			if (this.paramsValidation(params)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.NAME] = this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER);

				CMDBuild.proxy.management.routes.Card.readClassByName({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							if (!Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER))) // Single card selection
								return this.manageIdentifierCard(decodedResponse, this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER));

							if (!Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))) // SimpleFilter
								return this.manageFilterSimple(decodedResponse);
						}

						return CMDBuild.core.Message.error(
							CMDBuild.Translation.common.failure,
							CMDBuild.Translation.errors.routesInvalidClassIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER) + ')',
							false
						);
					}
				});
			}
		},

		/**
		 * @param {Object} classObject
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 *
		 * FIXME: waiting for module refactor
		 */
		manageFilterSimple: function (classObject, callback) {
			var simpleFilterDefinitionObject = this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER);

			var params = {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER);
			params[CMDBuild.core.constants.Proxy.FILTER] = '{"attribute":{"simple":{"attribute":"'
				+ simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.KEY] + '","operator":"equal","value":["'
				+ simpleFilterDefinitionObject[CMDBuild.core.constants.Proxy.VALUE] + '"]}}}';

			CMDBuild.proxy.management.routes.Card.readAllCards({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					if (decodedResponse[CMDBuild.core.constants.Proxy.RESULTS] == 1) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

						this.manageIdentifierCard(
							classObject,
							decodedResponse[0]['Id'],
							callback
						);
					} else {
						CMDBuild.core.Message.error(
							CMDBuild.Translation.common.failure,
							CMDBuild.Translation.errors.routesInvalidSimpleFilter,
							false
						);
					}
				}
			});
		},

		/**
		 * @param {Object} classObject
		 * @param {Number} cardIdentifier
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageIdentifierCard: function (classObject, cardIdentifier, callback) {
			if (!Ext.isNumber(cardIdentifier) || Ext.isEmpty(cardIdentifier))
				return _error('manageIdentifierCard(): invalid cardIdentifier parameter', this, cardIdentifier);

			Ext.Function.createDelayed(function () {
				CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', {
					Id: cardIdentifier,
					IdClass: classObject[CMDBuild.core.constants.Proxy.ID]
				});

				if (Ext.isFunction(callback))
					Ext.callback(callback, this);
			}, 500, this)();
		},

		/**
		 * @param {Object} params
		 *
		 * @returns  {Boolean}
		 *
		 * @override
		 * @private
		 */
		paramsValidation: function (params) {
			this.paramsModel = Ext.create('CMDBuild.model.management.routes.Card', params);

			// Class identifier validation
			if (Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidClassIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Card identifier validation
			if (
				Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER))
				&& Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))
			) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidCardIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Print format validation
			if (!Ext.Array.contains(this.supportedPrintFormats, this.paramsModel.get(CMDBuild.core.constants.Proxy.FORMAT))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidPrintFormat + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.FORMAT) + ')',
					false
				);

				return false;
			}

			return true;
		},

		/**
		 * @param {Object} params
		 * @param {String} params.format
		 * @param {String} path
		 * @param {Object} router
		 *
		 * @returns {Void}
		 *
		 * FIXME: waiting for module refactor
		 */
		print: function (params, path, router) {
			if (this.paramsValidation(params)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.NAME] = this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER);

				CMDBuild.proxy.management.routes.Card.readClassByName({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							if (!Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER))) // Single card selection
								return this.manageIdentifierCard(
									decodedResponse,
									this.paramsModel.get(CMDBuild.core.constants.Proxy.CARD_IDENTIFIER),
									Ext.Function.createDelayed(function () {
										CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', 'class').cardPanelController.onPrintCardMenuClick(
											this.paramsModel.get(CMDBuild.core.constants.Proxy.FORMAT)
										);
									}, 1500, this)
								);

							if (!Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.SIMPLE_FILTER))) // SimpleFilter
								return this.manageFilterSimple(
									decodedResponse,
									Ext.Function.createDelayed(function () {
										CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', 'class').cardPanelController.onPrintCardMenuClick(
											this.paramsModel.get(CMDBuild.core.constants.Proxy.FORMAT)
										);
									}, 1500, this)
								);
						}

						return CMDBuild.core.Message.error(
							CMDBuild.Translation.common.failure,
							CMDBuild.Translation.errors.routesInvalidClassIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER) + ')',
							false
						);
					}
				});
			}
		}
	});

})();
