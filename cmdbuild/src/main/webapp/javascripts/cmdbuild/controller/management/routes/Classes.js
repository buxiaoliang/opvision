(function () {

	Ext.define('CMDBuild.controller.management.routes.Classes', {
		extend: 'CMDBuild.controller.common.abstract.Routes',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.routes.Classes'
		],

		/**
		 * @property {CMDBuild.model.management.routes.Classes}
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

				CMDBuild.proxy.management.routes.Classes.readClassByName({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse))
							return this.manageIdentifierClass(decodedResponse);

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
		 * Apply clientFilter to grid
		 *
		 * @param {Object} classObject
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 *
		 * FIXME: waiting for module refactor
		 */
		manageFilterClient: function(classObject, callback) {
			if (
				Ext.isObject(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER))
				&& !Ext.Object.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER))
			) {
				Ext.Function.createDelayed(function () {
					var classModel = Ext.create('CMDBuild.cache.CMEntryTypeModel', classObject);
					classModel.set(CMDBuild.core.constants.Proxy.FILTER, Ext.encode(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER))); // Inject filter in entryType object

					CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', 'class').onViewOnFront(classModel);

					if (Ext.isFunction(callback))
						Ext.Function.createDelayed(callback, 500, this)();
				}, 1500, this)();
			}

			if (Ext.isFunction(callback))
				Ext.callback(callback, this);
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
		manageIdentifierClass: function (classObject, callback) {
			// Use runtime configuration to select class
			CMDBuild.configuration.runtime.set(CMDBuild.core.constants.Proxy.STARTING_CLASS_ID, classObject[CMDBuild.core.constants.Proxy.ID]);

			CMDBuild.global.controller.MainViewport.cmfg('mainViewportStartingEntitySelect');

			this.manageFilterClient(classObject, callback);
		},

		/**
		 * @param {Object} params
		 *
		 * @return  {Boolean}
		 *
		 * @override
		 * @private
		 */
		paramsValidation: function (params) {
			this.paramsModel = Ext.create('CMDBuild.model.management.routes.Classes', params);

			// Class identifier validation
			if (Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER))) {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.routesInvalidClassIdentifier + ' (' + this.paramsModel.get(CMDBuild.core.constants.Proxy.CLASS_IDENTIFIER) + ')',
					false
				);

				return false;
			}

			// Client filter validation
			if (!Ext.isEmpty(this.paramsModel.get(CMDBuild.core.constants.Proxy.CLIENT_FILTER))) {
				// FIXME: validate filter with server side call
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

			return this.callParent(arguments);
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

				CMDBuild.proxy.management.routes.Classes.readClassByName({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse))
							return this.manageIdentifierClass(decodedResponse, function () {
								var classGridController = CMDBuild.global.controller.MainViewport.cmfg('mainViewportModuleControllerGet', 'class').gridController;

								classGridController.view.updateStoreForClassId(decodedResponse['id'], {
									cb: function () {
										classGridController.onPrintGridMenuClick(
											this.paramsModel.get(CMDBuild.core.constants.Proxy.FORMAT)
										);
									},
									scope: this
								});
							});

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
