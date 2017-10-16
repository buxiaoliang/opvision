(function () {

	Ext.define('CMDBuild.controller.common.MainViewport', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Function}
		 */
		callback: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'mainViewportAccordionControllerExists',
			'mainViewportAccordionControllerGet',
			'mainViewportAccordionControllerUpdateStore',
			'mainViewportAccordionControllerWithNodeWithIdGet',
			'mainViewportAccordionDeselect',
			'mainViewportAccordionIsCollapsed',
			'mainViewportAccordionSetDisabled',
			'mainViewportAccordionViewsGet',
			'mainViewportActivitySelect',
			'mainViewportCardSelect',
			'mainViewportDanglingCardGet',
			'mainViewportInstanceNameSet',
			'mainViewportModuleControllerExists',
			'mainViewportModuleControllerGet',
			'mainViewportModuleShow',
			'mainViewportModuleViewsGet',
			'mainViewportSelectFirstExpandedAccordionSelectableNode',
			'mainViewportStartingEntitySelect',
			'onMainViewportAccordionSelect',
			'onMainViewportCreditsClick'
		],

		/**
		 * Accordion definition objects
		 *
		 * @cfg {Array}
		 */
		accordion: [],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		accordionControllers: {},

		/**
		 * The danglig card is used to open a card from a panel to another (something called follow the relations between cards)
		 *
		 * @property {Object}
		 *
		 * @private
		 */
		danglingCard: null,

		/**
		 * @cfg {Array}
		 */
		enableSynchronizationForAccordions: [
			'class',
			CMDBuild.core.constants.ModuleIdentifiers.getWorkflow()
		],

		/**
		 * @cfg {Boolean}
		 */
		isAdministration: false,

		/**
		 * Module definition objects
		 *
		 * @cfg {Array}
		 */
		module: [],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		moduleControllers: [],

		/**
		 * @cfg {Object}
		 */
		scope: undefined,

		/**
		 * @property {CMDBuild.view.common.MainViewport}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configObject) {
			this.callParent(arguments);

			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'mainViewportAccordionBarrier',
				scope: this,
				callback: function () {
					this.view = Ext.create('CMDBuild.view.common.MainViewport', {
						delegate: this,

						listeners: {
							scope: this,
							afterrender: function (viewport, eOpts) {
								if (Ext.isFunction(this.callback))
									Ext.callback(this.callback, this.scope || this);
							}
						}
					});
				}
			});

			this.accordionControllerBuild(requestBarrier),
			this.moduleControllerBuild();

			requestBarrier.finalize('mainViewportAccordionBarrier', true);
		},

		// Accordion manage methods
			/**
			 * Request barrier implementation to synchronize accordion creation
			 *
			 * @param {CMDBuild.core.RequestBarrier} requestBarrier
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			accordionControllerBuild: function (requestBarrier) {
				if (Ext.isArray(this.accordion) && !Ext.isEmpty(this.accordion))
					Ext.Array.each(this.accordion, function (controllerDefinition, i, allControllerDefinitions) {
						if (
							Ext.isObject(controllerDefinition) && !Ext.Object.isEmpty(controllerDefinition)
							&& Ext.isString(controllerDefinition.className) && !Ext.isEmpty(controllerDefinition.className)
							&& Ext.isString(controllerDefinition.identifier) && !Ext.isEmpty(controllerDefinition.identifier)
						) {
							this.accordionControllers[controllerDefinition.identifier] = Ext.create(controllerDefinition.className, {
								parentDelegate: this, // Inject as parentDelegate in accordion controllers
								identifier: controllerDefinition.identifier,
								callback: requestBarrier.getCallback('mainViewportAccordionBarrier')
							});
						}
					}, this);
			},

			/**
			 * @param {String} identifier
			 *
			 * @returns {Boolean} accordionExists
			 */
			mainViewportAccordionControllerExists: function (identifier) {
				var accordionControllerExists = (
					!Ext.isEmpty(identifier) && Ext.isString(identifier)
					&& !Ext.isEmpty(this.accordionControllers[identifier])
				);

				// Error handling
					if (!accordionControllerExists)
						return _error('mainViewportAccordionControllerExists(): accordion not found', this, identifier);
				// END: Error handling

				return accordionControllerExists;
			},

			/**
			 * @param {String} identifier
			 *
			 * @returns {Mixed} or null
			 */
			mainViewportAccordionControllerGet: function (identifier) {
				if (this.mainViewportAccordionControllerExists(identifier))
					return this.accordionControllers[identifier];

				return null;
			},

			/**
			 * Returns first accordion witch contains a node with give id
			 *
			 * @param {String} id
			 *
			 * @returns {Mixed or null} searchedAccordionController
			 */
			mainViewportAccordionControllerWithNodeWithIdGet: function (id) {
				var searchedAccordionController = this.accordionControllerExpandedGet();

				// First search in expanded accordion
				if (!Ext.isEmpty(searchedAccordionController) && !Ext.isEmpty(searchedAccordionController.cmfg('accordionNodeByIdGet', id)))
					return searchedAccordionController;

				// Then in other ones
				searchedAccordionController = null;

				Ext.Object.each(this.accordionControllers, function (identifier, accordionController, myself) {
					if (!Ext.isEmpty(accordionController) && !Ext.isEmpty(accordionController.cmfg('accordionNodeByIdGet', id))) {
						searchedAccordionController = accordionController;

						return false;
					}
				}, this);

				return searchedAccordionController;
			},

			/**
			 * Forwarder method
			 *
			 * @param {Object} parameters
			 * @param {String} parameters.identifier
			 * @param {Object} parameters.params
			 * @param {Boolean} parameters.params.loadMask
			 * @param {Number} parameters.params.selectionId
			 *
			 * @returns {Void}
			 */
			mainViewportAccordionControllerUpdateStore: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
				parameters.params.selectionId = Ext.isEmpty(parameters.params.selectionId) ? null : parameters.params.selectionId;

				var accordionController = this.cmfg('mainViewportAccordionControllerGet', parameters.identifier);

				// Error handling
					if (!Ext.isObject(accordionController) || Ext.Object.isEmpty(accordionController) || !Ext.isFunction(accordionController.cmfg))
						return _error('mainViewportAccordionControllerUpdateStore(): accordion controller retriving error', this, accordionController);
				// END: Error handling

				accordionController.cmfg('accordionUpdateStore', parameters.params);
			},

			/**
			 * Forwarder method
			 *
			 * @param {String} identifier
			 *
			 * @returns {Void}
			 */
			mainViewportAccordionDeselect: function (identifier) {
				if (this.mainViewportAccordionControllerExists(identifier))
					this.cmfg('mainViewportAccordionControllerGet', identifier).cmfg('accordionDeselect');
			},

			/**
			 * @returns {Boolean}
			 */
			mainViewportAccordionIsCollapsed: function () {
				return !this.isAdministration && CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.HIDE_SIDE_PANEL);
			},

			/**
			 * Forwarder method
			 *
			 * @param {Object} parameters
			 * @param {String} parameters.identifier
			 * @param {Boolean} parameters.state
			 *
			 * @returns {Void}
			 */
			mainViewportAccordionSetDisabled: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.state = Ext.isBoolean(parameters.state) ? parameters.state : true;

				if (this.mainViewportAccordionControllerExists(parameters.identifier))
					this.cmfg('mainViewportAccordionControllerGet', parameters.identifier).getView().setDisabled(parameters.state);
			},

			/**
			 * @returns {Array} views
			 */
			mainViewportAccordionViewsGet: function () {
				var views = [];

				if (Ext.isObject(this.accordionControllers) && !Ext.Object.isEmpty(this.accordionControllers))
					Ext.Object.each(this.accordionControllers, function (id, controller, myself) {
						if (Ext.isObject(controller) && !Ext.Object.isEmpty(controller) && Ext.isFunction(controller.getView))
							views.push(controller.getView());
					}, this);

				return views;
			},

			/**
			 * Returns expanded accordion's controller
			 *
			 * @returns {Mixed or null} controllerAccordion
			 *
			 * @private
			 */
			accordionControllerExpandedGet: function () {
				var controllerAccordion = null;

				Ext.Object.each(this.accordionControllers, function (identifier, accordionController, myself) {
					if (!Ext.isEmpty(accordionController) && !accordionController.getView().getCollapsed()) {
						controllerAccordion = accordionController;

						return false;
					}
				}, this);

				return controllerAccordion;
			},

			/**
			 * @returns {Mixed or null} searchedAccordionController
			 *
			 * @private
			 */
			accordionControllerWithSelectableNodeGet: function () {
				var searchedAccordionController = null;

				Ext.Object.each(this.accordionControllers, function (identifier, accordionController, myself) {
					if (!Ext.isEmpty(accordionController) && !Ext.isEmpty(accordionController.cmfg('accordionFirtsSelectableNodeGet'))) {
						searchedAccordionController = accordionController;

						return false;
					}
				}, this);

				return searchedAccordionController;
			},

		// DanglingCard property methods
			/**
			 * @returns {Object}
			 */
			mainViewportDanglingCardGet: function () {
				var danglingCard = Ext.clone(this.danglingCard);

				this.danglingCardReset();

				return danglingCard;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			danglingCardReset: function () {
				this.danglingCard = null;
			},

			/**
			 * @param {Object} danglingCard
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			danglingCardSet: function (danglingCard) {
				this.danglingCard = danglingCard;
			},

		/**
		 * @param {Object} parameters
		 * @param {Boolean or Object} parameters.activateFirstTab - if object selects object as tab otherwise selects first one
		 * @param {Number} parameters.instanceId
		 * @param {Number} parameters.workflowId
		 *
		 * @returns {Void}
		 */
		mainViewportActivitySelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.activateFirstTab = Ext.isEmpty(parameters.activateFirstTab) ? true : parameters.activateFirstTab;

			var accordionController = this.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID]),
				moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getWorkflow());

			// Error handling
				if (!Ext.isString(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]) || Ext.isEmpty(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]))
					return _error('mainViewportActivitySelect(): unmanaged instanceId parameter', this, parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]);

				if (!Ext.isString(parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID]) || Ext.isEmpty(parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID]))
					return _error('mainViewportActivitySelect(): unmanaged workflowId parameter', this, parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID]);

				if (!Ext.isObject(moduleController) || Ext.Object.isEmpty(moduleController) || !Ext.isFunction(moduleController.cmfg))
					return _error('mainViewportActivitySelect(): module controller retriving error', this, moduleController);

				if (!Ext.isObject(accordionController) || Ext.Object.isEmpty(accordionController) || !Ext.isFunction(accordionController.cmfg))
					return CMDBuild.core.Message.warning(CMDBuild.Translation.warning, CMDBuild.Translation.warnings.itemNotAvailable);
			// END: Error handling

			Ext.apply(accordionController, {
				disableSelection: true,
				scope: this,
				callback: function () {
					accordionController.cmfg('accordionDeselect'); // Instruction required or selection doesn't work if exists another selection
					accordionController.cmfg('accordionNodeByIdSelect', { id: parameters[CMDBuild.core.constants.Proxy.WORKFLOW_ID] });

					moduleController.cmfg('workflowTreeApplyStoreEvent', {
						eventName: 'load',
						fn: function (store, node, records, successful, eOpts) {
							moduleController.cmfg('workflowTreeActivitySelect', {
								enableForceFlowStatus: true,
								instanceId: Ext.isString(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID])
									? parseInt(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID])
									: parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]
							});
						},
						scope: this,
						options: { single: true }
					});
				}
			});

			accordionController.cmfg('accordionExpand');
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean or Object} parameters.activateFirstTab - if object selects object as tab otherwise selects first one
		 * @param {String} parameters.flowStatus
		 * @param {Number} parameters.Id - card id
		 * @param {Number} parameters.IdClass
		 *
		 * @returns {Void}
		 *
		 * FIXME: legacy implementation used from classes and all old implementation, to fix on classes module refactor
		 */
		mainViewportCardSelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (Ext.isEmpty(parameters['Id']) || Ext.isEmpty(parameters['IdClass']))
					return _error('mainViewportActivitySelect(): unmanaged parameter', this, parameters);
			// END: Error handling

			if (_CMCache.isClassById(parameters['IdClass'])) { /** @legacy */
				parameters.activateFirstTab = Ext.isEmpty(parameters.activateFirstTab) ? true : parameters.activateFirstTab;

				var accordionController = this.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', parameters['IdClass']);

				this.danglingCardSet(parameters);

				if (!Ext.isEmpty(accordionController) && Ext.isFunction(accordionController.cmfg)) {
					Ext.apply(accordionController, {
						disableSelection: true,
						scope: this,
						callback: function () {
							accordionController.cmfg('accordionDeselect');
							accordionController.cmfg('accordionNodeByIdSelect', { id: parameters['IdClass'] });
						}
					});

					accordionController.cmfg('accordionExpand');
				} else {
					CMDBuild.core.Message.warning(CMDBuild.Translation.warning, CMDBuild.Translation.warnings.itemNotAvailable);
				}
			} else {
				var params = {};
				params['activateFirstTab'] = Ext.isEmpty(parameters.activateFirstTab) ? true : parameters.activateFirstTab;
				params[CMDBuild.core.constants.Proxy.INSTANCE_ID] = parameters['Id'];
				params[CMDBuild.core.constants.Proxy.WORKFLOW_ID] = parameters['IdClass'];

				this.cmfg('mainViewportActivitySelect', params);
			}
		},

		/**
		 * @param {String} name
		 *
		 * @returns {Void}
		 */
		mainViewportInstanceNameSet: function (name) {
			name = Ext.isString(name) ? name : '';

			var instanceNameContainer = Ext.get('instance-name');

			if (!Ext.isEmpty(instanceNameContainer)) {
				try {
					instanceNameContainer.setHTML(name);
				} catch (e) {
					// Prevents some Explorer error
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @administration
		 */
		mainViewportSelectFirstExpandedAccordionSelectableNode: function () {
			var controllerAccordion = this.accordionControllerExpandedGet();

			if (Ext.isObject(controllerAccordion) && !Ext.Object.isEmpty(controllerAccordion)) {
				this.cmfg('mainViewportModuleShow', { identifier: controllerAccordion.cmfg('accordionIdentifierGet') });

				controllerAccordion.cmfg('accordionFirstSelectableNodeSelect');
			}
		},

		/**
		 * Select selected entity at first page load
		 *
		 * @returns {Void}
		 *
		 * @management
		 */
		mainViewportStartingEntitySelect: function () {
			var startingClassId = (
					CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.STARTING_CLASS_ID) // Group's starting class
					|| CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.STARTING_CLASS) // Main configuration's starting class
				),
				accordionWithNodeController = Ext.isEmpty(startingClassId) ? null : this.cmfg('mainViewportAccordionControllerWithNodeWithIdGet', startingClassId),
				node = null;

			if (Ext.isObject(accordionWithNodeController) && !Ext.Object.isEmpty(accordionWithNodeController)) {
				Ext.apply(accordionWithNodeController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionWithNodeController.cmfg('accordionDeselect');
						accordionWithNodeController.cmfg('accordionNodeByIdSelect', { id: startingClassId });
					}
				});

				accordionWithNodeController.cmfg('accordionExpand');

				node = accordionWithNodeController.cmfg('accordionNodeByIdGet', startingClassId); // To manage selection if accordion are collapsed
			} else { // If no statingClass to select try to select fist selectable node
				var accordionController = this.accordionControllerWithSelectableNodeGet();

				if (Ext.isObject(accordionController) && !Ext.Object.isEmpty(accordionController)) {
					accordionController.cmfg('accordionExpand');

					node = accordionController.cmfg('accordionFirtsSelectableNodeGet'); // To manage selection if accordion are collapsed
				}
			}

			// Manage selection if accordion are collapsed
			if (this.cmfg('mainViewportAccordionIsCollapsed') && !Ext.isEmpty(node))
				this.cmfg('mainViewportModuleShow', {
					identifier: node.get('cmName'),
					parameters: node
				});
		},

		// Module manage methods
			/**
			 * @returns {Array} moduleViewsBuffer
			 *
			 * @private
			 */
			moduleControllerBuild: function () {
				if (Ext.isArray(this.module) && !Ext.isEmpty(this.module)) {
					this.moduleViewsBuffer = []; // FIXME: on full modules refactor this should be same as accordion build method

					Ext.Array.forEach(this.module, function (moduleControllerObject, i, allModuleControllerObjects) {
						if (Ext.isObject(moduleControllerObject) && !Ext.Object.isEmpty(moduleControllerObject)) {
							if (
								!Ext.isEmpty(moduleControllerObject.className) && Ext.isString(moduleControllerObject.className)
								&& !Ext.isEmpty(moduleControllerObject.identifier) && Ext.isString(moduleControllerObject.identifier)
							) { // New implementation standard
								var moduleController = Ext.create(moduleControllerObject.className, {
									parentDelegate: this, // Inject as parentDelegate in accordion controllers
									identifier: moduleControllerObject.identifier
								});

								this.moduleControllers[moduleControllerObject.identifier] = moduleController;

								this.moduleViewsBuffer.push(moduleController.getView());
							} else if (
								!Ext.isEmpty(moduleControllerObject.cmName) && Ext.isString(moduleControllerObject.cmName)
								&& !Ext.isEmpty(moduleControllerObject.cmfg) && Ext.isFunction(moduleControllerObject.cmfg)
							) { // @deprecated
								if (!Ext.isEmpty(moduleControllerObject.cmfg('identifierGet'))) {
									moduleControllerObject.parentDelegate = this; // Inject as parentDelegate in module controllers

									this.moduleControllers[moduleControllerObject.cmfg('identifierGet')] = moduleControllerObject;

									this.moduleViewsBuffer.push(moduleControllerObject.getView());
								}
							} else if (!Ext.isEmpty(moduleControllerObject.cmName) && Ext.isString(moduleControllerObject.cmName)) { // @deprecated
								this.moduleControllers[moduleControllerObject.cmName] = moduleControllerObject.delegate;

								if (Ext.isFunction(moduleControllerObject.cmControllerType)) {
									// We start to use the cmcreate factory method to have the possibility to inject the sub-controllers in tests
									if (Ext.isFunction(moduleControllerObject.cmControllerType.cmcreate)) {
										this.moduleControllers[moduleControllerObject.cmName] = new moduleControllerObject.cmControllerType.cmcreate(moduleControllerObject);
									} else {
										this.moduleControllers[moduleControllerObject.cmName] = new moduleControllerObject.cmControllerType(moduleControllerObject);
									}
								} else if (Ext.isString(moduleControllerObject.cmControllerType)) { // To use Ext.loader to asynchronous load also controllers
									this.moduleControllers[moduleControllerObject.cmName] = Ext.create(moduleControllerObject.cmControllerType, moduleControllerObject);
								} else {
									this.moduleControllers[moduleControllerObject.cmName] = new CMDBuild.controller.CMBasePanelController(moduleControllerObject);
								}

								this.moduleViewsBuffer.push(moduleControllerObject);
							}
						}
					}, this);
				}
			},

			/**
			 * @param {String} identifier
			 *
			 * @returns {Boolean}
			 */
			mainViewportModuleControllerExists: function (identifier) {
				var moduleControllerExists = (
					!Ext.isEmpty(identifier) && Ext.isString(identifier)
					&& !Ext.isEmpty(this.moduleControllers[identifier])
				);

				// FIXME: shows an error
//				// Error handling
//					if (!moduleControllerExists)
//						return _error('mainViewportModuleControllerExists(): module not found', this, identifier);
//				// END: Error handling

				return moduleControllerExists;
			},

			/**
			 * @param {String} identifier
			 *
			 * @returns {Mixed} or null
			 */
			mainViewportModuleControllerGet: function (identifier) {
				if (this.cmfg('mainViewportModuleControllerExists', identifier))
					return this.moduleControllers[identifier];

				return null;
			},

			/**
			 * Show module view
			 *
			 * @param {Object} parameters
			 * @param {String} parameters.identifier
			 * @param {Object} parameters.parameters
			 *
			 * @returns {Boolean}
			 */
			mainViewportModuleShow: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.parameters = Ext.isEmpty(parameters.parameters) ? null : parameters.parameters;

				if (this.cmfg('mainViewportModuleControllerExists', parameters.identifier)) {
					var modulePanel = this.cmfg('mainViewportModuleControllerGet', parameters.identifier);

					if (Ext.isObject(modulePanel) && !Ext.Object.isEmpty(modulePanel)) {
						if (Ext.isFunction(modulePanel.getView)) {
							modulePanel = modulePanel.getView();
						} else if (!Ext.isEmpty(modulePanel.view)) { /** @deprecated */
							modulePanel = modulePanel.view;
						}

						this.view.moduleContainer.getLayout().setActiveItem(modulePanel);

						/**
						 * Legacy event
						 *
						 * @deprecated
						 */
						modulePanel.fireEvent('CM_iamtofront', parameters.parameters);

						if (Ext.isObject(modulePanel.delegate) && !Ext.Object.isEmpty(modulePanel.delegate) && Ext.isFunction(modulePanel.delegate.cmfg))
							modulePanel.delegate.cmfg('onModuleInit', parameters.parameters);
					}

					return true;
				}

				return false;
			},

			/**
			 * @returns {Array} views
			 */
			mainViewportModuleViewsGet: function () {
				return this.moduleViewsBuffer;
			},

		/**
		 * Synchronize Class and Workflow selection from relative accordions with Navigation accordion, active only in management side
		 *
		 * @param {Object} parameters
		 * @param {String} parameters.id
		 * @param {CMDBuild.model.common.Accordion} parameters.node
		 *
		 * @returns {Void}
		 */
		onMainViewportAccordionSelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isObject(parameters.node) && !Ext.Object.isEmpty(parameters.node)
				&& Ext.isString(parameters.id) && !Ext.isEmpty(parameters.id)
				&& Ext.Array.contains(this.enableSynchronizationForAccordions, parameters.id)
				&& !this.isAdministration
			) {
				var menuAccordionController = this.cmfg('mainViewportAccordionControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getNavigation()),
					node = parameters.node;

				if (menuAccordionController.cmfg('accordionNodeByIdExists', node.get(CMDBuild.core.constants.Proxy.ENTITY_ID)))
					menuAccordionController.cmfg('accordionNodeByIdSelect', {
						id: node.get(CMDBuild.core.constants.Proxy.ENTITY_ID),
						mode: 'silently'
					});
			}
		},

		/**
		 * Manages footer credits link click action
		 *
		 * @returns {Void}
		 */
		onMainViewportCreditsClick: function () {
			Ext.create('CMDBuild.core.window.Credits').show();
		}
	});

})();
