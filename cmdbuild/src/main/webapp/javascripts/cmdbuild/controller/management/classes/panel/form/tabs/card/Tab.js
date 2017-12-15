(function () {

	/**
	 * @override
	 * @legacy
	 *
	 * FIXME: waiting for refactor
	 */
	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.card.Tab', {
		extend: 'CMDBuild.controller.common.panel.module.form.Tab',

		uses: [
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.classes.panel.form.tabs.Card'
		],

		mixins: {
			observable: 'Ext.util.Observable',
			viewMode: 'CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ViewMode'
		},

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabCardSelectedItemAttributesGet = panelGridAndFormSelectedItemAttributesGet',
			'classesFormTabCardSelectedItemAttributesIsEmpty = panelGridAndFormSelectedItemAttributesIsEmpty',
			'classesFormTabCardSelectedEntityGet = panelGridAndFormSelectedEntityGet',
			'classesFormTabCardSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'classesFormTabCardSelectedItemGet = panelGridAndFormSelectedItemGet',
			'classesFormTabCardSelectedItemIsEmpty = panelGridAndFormSelectedItemIsEmpty',
			'classesFormTabCardSelectedItemWidgetsGetAll = panelGridAndFormSelectedItemWidgetsGet',
			'classesFormTabCardSelectedItemWidgetsIsEmpty = panelGridAndFormSelectedItemWidgetsIsEmpty',
			'classesFormTabCardSelectedPreviousItemGet = panelGridAndFormSelectedPreviousItemGet',
			'classesFormTabCardSelectedPreviousItemIsEmpty = panelGridAndFormSelectedPreviousItemIsEmpty',
			'classesFormTabCardSelectedItemIsWritable',
			'classesFormTabCardUiUpdate = panelGridAndFormUiUpdate',
			'onClassesFormTabCardPrintButtonClick',
			'onClassesFormTabCardRemoveButtonClick',
			'onClassesFormTabCardSaveButtonClick = onPanelModuleFormToolbarBottomSaveButtonClick',
			'onClassesFormTabCardShow = onPanelModuleFormTabShow',
			'panelGridAndFormTabPanelGet',
			'panelGridAndFormMixinsViewModeEquals = classesFormTabCardViewModeEquals, panelGridAndFormViewModeEquals',
			'panelGridAndFormMixinsViewModeGet = classesFormTabCardViewModeGet, panelGridAndFormViewModeGet',
			'panelGridAndFormMixinsViewModeSet = classesFormTabCardViewModeSet',
			'panelModuleFormFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'panelModuleFormTabDisable',
			'panelModuleFormTabReset = classesFormTabCardReset'
		],

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.card.panel.Panel}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.management.classes.panel.form.tabs.card.widget.panel.ButtonGroup}
		 */
		controllerPanelWidget: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.model.management.classes.panel.form.tabs.card.Item}
		 *
		 * @private
		 */
		selectedPreviousItem: undefined,

		/**
		 * @property {CMDBuild.model.management.classes.panel.form.tabs.card.Item}
		 *
		 * @private
		 */
		selectedItem: undefined,

		/**
		 * @returns {CMDBuild.model.management.classes.panel.form.tabs.card.entity.Entity}
		 *
		 * @private
		 */
		selectedEntity: undefined,

		/**
		 * @returns {Array}
		 *
		 * @private
		 */
		selectedItemAttributes: [],

		/**
		 * @returns {Array}
		 *
		 * @private
		 */
		selectedItemWidgets: [],

		/**
		 * Definitions of all sub-classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			form: 'CMDBuild.controller.management.classes.panel.form.tabs.card.panel.Panel',
			panelWidget: 'CMDBuild.controller.management.classes.panel.form.tabs.card.widget.panel.ButtonGroup',
			view: 'CMDBuild.view.management.classes.panel.form.tabs.card.TabView',
		},

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.card.TabView}
		 */
		view: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		viewModeManaged: ['add', 'clone', 'edit', 'read', 'readOnly'],

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.CMModCardController} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.mixins.observable.constructor.call(this, arguments);

			this.callParent(arguments);

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });

			this.buildCardModuleStateDelegate();
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		buildCardModuleStateDelegate: function () {
			this.cardStateDelegate = new CMDBuild.state.CMCardModuleStateDelegate();

			this.cardStateDelegate.onEntryTypeDidChange = Ext.bind(function (state, entryType) { // a.k.a. onEntryTypeSelected
				if (Ext.isObject(entryType) && !Ext.Object.isEmpty(entryType)) {
					this.classesFormTabCardSelectedPreviousItemReset();

					var params = {};
					params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = entryType.get(CMDBuild.core.constants.Proxy.NAME);

					this.cmfg('classesFormTabCardUiUpdate', params);
				}
			}, this);

			this.cardStateDelegate.onCardDidChange = Ext.bind(function (state, card) { // a.k.a. onCardSelected
				if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
					var params = {};

					if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
						params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

					if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
						params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = card.get(CMDBuild.core.constants.Proxy.CLASS_NAME);
						params[CMDBuild.core.constants.Proxy.ITEM_ID] = card.get('Id');
					}

					this.cmfg('classesFormTabCardUiUpdate', params);
				}
			}, this);

			_CMCardModuleState.addDelegate(this.cardStateDelegate);

			if (this.view)
				this.mon(this.view, 'destroy', function (view) {
					_CMCardModuleState.removeDelegate(this.cardStateDelegate);

					delete this.cardStateDelegate;
				}, this);
		},

		/**
		 * @returns {Object} values
		 *
		 * @alias CMDBuild.controller.management.classes.CMBaseCardPanelController.addRefenceAttributesToDataIfNeeded()
		 * @override
		 */
		buildValues: function () {
			var values = {};

			if (!this.cmfg('panelGridAndFormSelectedItemIsEmpty')) {
				var referenceAttributes = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.REFERENCE_ATTRIBUTES);

				values = Ext.clone(this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.VALUES));

				if (Ext.isObject(referenceAttributes) && !Ext.Object.isEmpty(referenceAttributes))
					Ext.Object.each(referenceAttributes, function (attributeName, attributeValues, myself) {
						if (Ext.isObject(attributeValues) && !Ext.Object.isEmpty(attributeValues))
							Ext.Object.each(attributeValues, function (valueName, valueValue, myself) {
								values['_' + attributeName + '_' + valueName] = valueValue;
							}, this);
					}, this);
			}

			return values;
		},

		// SelectedEntity property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabCardSelectedEntityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabCardSelectedEntityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedEntityReset: function () {
				return this.propertyManageReset('selectedEntity');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedEntitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.card.entity.Entity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedItem property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabCardSelectedItemGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabCardSelectedItemIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemReset: function () {
				// Manage previous selected card (new card doesn't considered as valid previous card )
				if (!this.cmfg('classesFormTabCardSelectedItemIsEmpty', CMDBuild.core.constants.Proxy.ID))
					this.classesFormTabCardSelectedPreviousItemSet({ value: this.cmfg('classesFormTabCardSelectedItemGet').getData() });

				this.propertyManageReset('selectedItem');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.card.Item';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedItemAttributes property functions
			/**
			 * @returns {Array}
			 */
			classesFormTabCardSelectedItemAttributesGet: function () {
				return this.selectedItemAttributes;
			},

			/**
			 * @returns {Boolean}
			 */
			classesFormTabCardSelectedItemAttributesIsEmpty: function () {
				return Ext.isEmpty(this.selectedItemAttributes);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemAttributesReset: function () {
				this.selectedItemAttributes = [];
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemAttributesSet: function (attributes) {
				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes)) {
					attributes = CMDBuild.core.Utils.objectArraySort(attributes, CMDBuild.core.constants.Proxy.INDEX);

					Ext.Array.each(attributes, function (attributeObject, i, allAttributeObjects) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
							this.selectedItemAttributes.push(Ext.create('CMDBuild.model.common.attributes.Attribute', attributeObject));
					}, this);
				}
			},

		// SelectedItemWidgets property functions
			/**
			 * @returns {Array}
			 */
			classesFormTabCardSelectedItemWidgetsGetAll: function () {
				return this.selectedItemWidgets;
			},

			/**
			 * @returns {Boolean}
			 */
			classesFormTabCardSelectedItemWidgetsIsEmpty: function () {
				return Ext.isEmpty(this.selectedItemWidgets);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemWidgetsReset: function () {
				this.selectedItemWidgets = [];
			},

			/**
			 * @param {Array} definitions
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedItemWidgetsSet: function (definitions) {
				if (Ext.isArray(definitions) && !Ext.isEmpty(definitions))
					this.selectedItemWidgets = Ext.Array.clean(definitions);
			},

		// SelectedPreviousItem property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabCardSelectedPreviousItemGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedPreviousItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabCardSelectedPreviousItemIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedPreviousItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			classesFormTabCardSelectedPreviousItemReset: function () {
				return this.propertyManageReset('selectedPreviousItem');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabCardSelectedPreviousItemSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.card.PreviousItem';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedPreviousItem';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * NOTE: loading mask not implemented to avoid screen flickering on card select
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.addEntityId
		 * @param {Function} parameters.callback
		 * @param {String} parameters.itemEntityName
		 * @param {Number} parameters.itemId
		 * @param {String} parameters.entityName
		 * @param {String} parameters.fullScreen
		 * @param {Object} parameters.scope
		 * @param {Object or String or Number} parameters.subTabToSelect
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		classesFormTabCardUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.entityName = Ext.isString(parameters.entityName) ? parameters.entityName : null;
			parameters.fullScreen = Ext.isString(parameters.fullScreen) ? parameters.fullScreen : 'top';
			parameters.itemEntityName = Ext.isString(parameters.itemEntityName) ? parameters.itemEntityName : null;
			parameters.itemId = Ext.isNumber(parameters.itemId) ? parameters.itemId : null;
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';

			// Error handling
				if (!Ext.isString(parameters.entityName) || Ext.isEmpty(parameters.entityName))
					return _error('classesFormTabCardUiUpdate(): unmanaged entityName parameter', this, parameters.entityName);
			// END: Error handling

			// UI reset
			this.cmfg('classesFormTabCardReset');
			this.cmfg('classesFormTabCardViewModeSet', parameters.viewMode);

			/**
			 * @legacy
			 */
			switch (parameters.fullScreen) {
				case 'bottom': {
					_CMUIState.onlyFormIfFullScreen();
				} break;

				case 'top': {
					_CMUIState.onlyGridIfFullScreen();
				} break;
			}

			// Local variables reset
			this.classesFormTabCardSelectedItemAttributesReset();
			this.classesFormTabCardSelectedEntityReset();
			this.classesFormTabCardSelectedItemReset();
			this.classesFormTabCardSelectedItemWidgetsReset();

			// Fake item data for add card functionality
			if (Ext.isNumber(parameters.addEntityId) && !Ext.isEmpty(parameters.addEntityId))
				this.classesFormTabCardSelectedItemSet({
					value: {
						card: {
							IdClass: parameters.addEntityId,
							className: _CMCache.getEntryTypeNameById(parameters.addEntityId)
						}
					}
				});

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = parameters.itemId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = parameters.itemEntityName;
			
			this.readEntity(parameters.entityName, function () {
				this.readItem(params, function () {
					this.readItemWidgets(function () {
						this.readItemAttributes(function () {
							/**
							 * @legacy
							 */
							switch (this.cmfg('classesFormTabCardViewModeGet')) {
								case 'clone': {
									this.itemUnlock();

									this.classesFormTabCardSelectedItemSet({
										propertyName: CMDBuild.core.constants.Proxy.ID,
										value: null
									});

									this.parentDelegate.callForSubControllers('onCloneCard');
								} break;

								case 'edit': {
									this.itemLock({
										scope: this,
										callback: function () {
											this.parentDelegate.onModifyCardClick();
										}
									});
								} break;

								case 'read':
								case 'readOnly':
								default: {
									this.itemUnlock();
									if (this.parentDelegate.controllerMap.changeCardSilently) {
    									this.parentDelegate.controllerMap.changeCardSilently({
    										cardId : parameters.itemId,
    										className : parameters.itemEntityName
    									});
									}
									this.parentDelegate.controllerMap.displayMode();
								}
							}

							// Forward to sub-controllers
							this.controllerForm.cmfg('panelModuleFormPanelUiUpdate');
							this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupUiUpdate');

							this.view.setDisabled(
								this.cmfg('classesFormTabCardSelectedEntityIsEmpty')
								|| this.cmfg('classesFormTabCardSelectedItemIsEmpty')
							);

							/**
							 * Waiting for tab manage implementation on parent controller
							 *
							 * @legacy
							 */
							if (this.view.isVisible()) {
								this.cmfg('onClassesFormTabCardShow', {
									subTabToSelect: parameters.subTabToSelect,
									scope: parameters.scope,
									callback: parameters.callback
								});
							}
						});
					});
				});
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		itemLock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('classesFormTabCardSelectedItemIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);

				return CMDBuild.proxy.management.classes.panel.form.tabs.Card.lock({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						if (Ext.isFunction(parameters.callback))
							Ext.callback(parameters.callback, parameters.scope);
					}
				});
			}

			return Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		itemUnlock: function () {
			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('classesFormTabCardSelectedItemIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('classesFormTabCardSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.classes.panel.form.tabs.Card.unlock({
					params: params,
					loadMask: false
				});
			}
		},

		/**
		 * Emulate UiUpdate method
		 *
		 * @param {Number} classId
		 *
		 * @returns {Void}
		 *
		 * @public
		 */
		onAddCardButtonClick: function (classId) {
			var params = {};
			params['addEntityId'] = parseInt(classId); // FIXME: waiting for refactor (className required)
			params[CMDBuild.core.constants.Proxy.FULL_SCREEN] = 'bottom';
			params[CMDBuild.core.constants.Proxy.VIEW_MODE] = 'add';

			if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			this.cmfg('classesFormTabCardUiUpdate', params);
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabCardRemoveButtonClick: function () {
			Ext.MessageBox.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.MessageBox.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabCardSaveButtonClick: function () {
			if (this.controllerForm.cmfg('panelModulePanelFunctionsIsValid')) {
				var params = this.controllerForm.cmfg('panelModulePanelFunctionsDataGet', { includeDisabled: true });
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);

				Ext.apply(params, this.parentDelegate.getMapSaveParams(params)); // Map data provider

				if (this.cmfg('classesFormTabCardSelectedItemIsEmpty', CMDBuild.core.constants.Proxy.ID)) {
					params[CMDBuild.core.constants.Proxy.CARD_ID] = -1;

					CMDBuild.proxy.management.classes.panel.form.tabs.Card.create({
						params: params,
						loadMask: false,
						scope: this,
						success: this.successSave
					});
				} else {
					CMDBuild.proxy.management.classes.panel.form.tabs.Card.update({
						params: params,
						loadMask: false,
						scope: this,
						success: this.successSave
					});
				}
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 * @param {Object or String or Number} parameters.subTabToSelect
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 */
		onClassesFormTabCardShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// History record save
			if (
				!this.cmfg('classesFormTabCardSelectedEntityIsEmpty')
				&& !this.cmfg('classesFormTabCardSelectedItemIsEmpty')
				&& this.cmfg('classesFormTabCardViewModeEquals', ['read', 'readOnly'])
			) {
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: CMDBuild.core.constants.ModuleIdentifiers.getClasses(),
					entryType: {
						description: this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('classesFormTabCardSelectedEntityGet')
					},
					item: {
						description: this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
							|| this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.CODE),
						id: this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('classesFormTabCardSelectedItemGet')
					},
					section: {
						description: this.view.title,
						object: this.view
					}
				});
			}

			this.onPanelModuleFormTabShow(parameters); // CallParent alias
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 *
		 * FIXME: move to main controller to avoid double print window controller build (grid + form)
		 */
		onClassesFormTabCardPrintButtonClick: function (format) {
			if (Ext.isString(format) && !Ext.isEmpty(format)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
				params[CMDBuild.core.constants.Proxy.FORMAT] = format;

				this.controllerPrintWindow.cmfg('panelGridAndFormPrintWindowShow', {
					format: format,
					mode: 'cardDetails',
					params: params
				});
			}
		},

		/**
		 * @returns {CMDBuild.view.management.classes.CMCardTabPanel}
		 *
		 * @legacy
		 * @override
		 */
		panelGridAndFormTabPanelGet: function () {
			return this.parentDelegate.view.cardTabPanel;
		},

		/**
		 * @param {Function} callback
		 * @param {String} name
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		readEntity: function (name, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			if (Ext.isString(name) && !Ext.isEmpty(name)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.NAME] = name;

				return CMDBuild.proxy.management.classes.panel.form.tabs.Card.readClassByName({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						// Error handling
							if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
								return _error('readEntity(): unmanaged response', this, decodedResponse);
						// END: Error handling

						this.classesFormTabCardSelectedEntitySet({ value: decodedResponse });

						Ext.callback(callback, this);
					}
				});
			}

			return Ext.callback(callback, this);
		},

		/**
		 * @param {Function} callback
		 * @param {Object} params
		 * @param {Number} params.cardId
		 * @param {String} params.className
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		readItem: function (params, callback) {
			params = Ext.isObject(params) ? params : {};
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			if (
				Ext.isNumber(params.cardId) && !Ext.isEmpty(params.cardId)
				&& Ext.isString(params.className) && !Ext.isEmpty(params.className)
			) {
				return CMDBuild.proxy.management.classes.panel.form.tabs.Card.read({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						// Error handling
							if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
								return _error('readItem(): unmanaged response', this, decodedResponse);
						// END: Error handling

						this.classesFormTabCardSelectedItemSet({ value: decodedResponse });

						Ext.callback(callback, this);
					}
				});
			}

			return Ext.callback(callback, this);
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		readItemAttributes: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			if (!this.cmfg('classesFormTabCardSelectedItemIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);

				return CMDBuild.proxy.management.classes.panel.form.tabs.Card.readAttributes({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

						// Error handling
							if (!Ext.isArray(decodedResponse) || Ext.isEmpty(decodedResponse))
								return _error('readItemAttributes(): unmanaged response', this, decodedResponse);
						// END: Error handling

						this.classesFormTabCardSelectedItemAttributesSet(decodedResponse);

						Ext.callback(callback, this);
					}
				});
			}

			return Ext.callback(callback, this);
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: waiting for refactor (full module)
		 */
		readItemWidgets: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			if (!this.cmfg('classesFormTabCardSelectedItemIsEmpty', CMDBuild.core.constants.Proxy.ENTITY_NAME))
				return CMDBuild.proxy.management.classes.panel.form.tabs.Card.readWidgets({
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						var itemEntityName = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse) && Ext.isDefined(decodedResponse[itemEntityName]))
							this.classesFormTabCardSelectedItemWidgetsSet(decodedResponse[itemEntityName]);

						Ext.callback(callback, this);
					}
				});

			return Ext.callback(callback, this);
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 */
		removeItem: function () {
			// Error handling
				if (this.cmfg('classesFormTabCardSelectedItemIsEmpty'))
					return _error('removeItem(): unmanaged selectedItem property', this, this.cmfg('classesFormTabCardSelectedItemGet'));
			// END: Error handling

			var params = {};
			params['Id'] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params['IdClass'] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_ID);

			CMDBuild.proxy.management.classes.panel.form.tabs.Card.remove({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					/** @legacy on cm-card-removed (cardRemoved) */
						this.parentDelegate.gridController.onCardDeleted();

						_CMCache.onClassContentChanged(this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.ID));

					var params = {};

					if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
						params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

					this.cmfg('classesFormTabCardUiUpdate', params);
				}
			});
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		successSave: function (response, options, decodedResponse) {
			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('successSave(): unmanaged response', this, decodedResponse);
			// END: Error handling

			/** @legacy on cm-card-saved (cardSaved) */
				var params = {
					Id: decodedResponse[CMDBuild.core.constants.Proxy.ID] || this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID), // If is a new card, the id is given by the request
					IdClass: this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.ID)
				};

				this.parentDelegate.gridController.onCardSaved(params);
				this.parentDelegate.controllerMap.onCardSaved(params);

				_CMCache.onClassContentChanged(this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.ID));
				_CMUIState.onlyGridIfFullScreen();

			var params = {};
			params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
			params[CMDBuild.core.constants.Proxy.ITEM_ID] = decodedResponse[CMDBuild.core.constants.Proxy.ID] || this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);

			if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			this.cmfg('classesFormTabCardUiUpdate', params);
		},

		/**
		 * @returns {Boolean}
		 *
		 * @private
		 */
		classesFormTabCardSelectedItemIsWritable: function() {
			var isWritable = true;
			if (Ext.isObject(this.selectedItem) && !Ext.isEmpty(this.selectedItem)) {
				var selectedItem = this.selectedItem;
				
				if(Ext.isObject(selectedItem.data) && !Ext.isEmpty(selectedItem.data)) {
					var data = selectedItem.data;
					
					if(Ext.isObject(data[CMDBuild.core.constants.Proxy.PERMISSIONS]) && !Ext.isEmpty(data[CMDBuild.core.constants.Proxy.PERMISSIONS])) {
						isWritable = data[CMDBuild.core.constants.Proxy.PERMISSIONS][CMDBuild.core.constants.Proxy.WRITABLE] == 'true'
					}
				}
			}
			return isWritable;
		}
	});

})();
