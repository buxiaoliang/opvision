(function() {

	// TODO: fix to use class property requires (unusable at the moment because
	// of class wrong name)
	Ext.require([ 'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.DefaultFilters' ]);

	Ext
			.define(
					'CMDBuild.controller.management.common.CMModController',
					{
						extend : 'CMDBuild.controller.CMBasePanelController',

						mixins : {
							commonFunctions : 'CMDBuild.controller.management.common.CMModClassAndWFCommons',
							observable : 'Ext.util.Observable'
						},

						constructor : function(view) {
							this.callParent(arguments);

							this.view.delegate = this;

							this.buildSubControllers();
						},

						/**
						 * @param {Object}
						 *            entryType
						 */
						onViewOnFront : function(entryType) {
							if (!Ext.isEmpty(entryType)) {
								var idPropertyName = Ext
										.isEmpty(entryType.get(CMDBuild.core.constants.Proxy.ENTITY_ID)) ? CMDBuild.core.constants.Proxy.ID
										: CMDBuild.core.constants.Proxy.ENTITY_ID;
								var dc = CMDBuild.global.controller.MainViewport.cmfg('mainViewportDanglingCardGet');
								var filter = entryType.get(CMDBuild.core.constants.Proxy.FILTER);
								var newEntryId = entryType.get(idPropertyName);

								this.selectedAccordionNode = entryType; // FIXME:
								// hack
								// to
								// temporary
								// fix
								// DataView
								// bug

								if (CMDBuild.configuration.userInterface
										.get(CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE))
									_CMUIState.onlyGrid();

								// If we haven't a filter try to get default one
								// from server
								if (Ext.isEmpty(filter)) {
									var params = {};
									params[CMDBuild.core.constants.Proxy.CLASS_NAME] = entryType
											.get(CMDBuild.core.constants.Proxy.NAME);
									params[CMDBuild.core.constants.Proxy.GROUP] = CMDBuild.configuration.runtime
											.get(CMDBuild.core.constants.Proxy.DEFAULT_GROUP_NAME);

									CMDBuild.proxy.administration.userAndGroup.group.tabs.DefaultFilters
											.read({
												params : params,
												scope : this,
												success : function(response, options, decodedResponse) {
													decodedResponse = decodedResponse.response.elements[0];

													if (!Ext.isEmpty(decodedResponse)) {
														if (Ext
																.isString(decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION])
																&& CMDBuild.core.Utils
																		.isJsonString(decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION])) {
															decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext
																	.decode(decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION]);
														}

														filter = Ext.create('CMDBuild.model.CMFilterModel',
																decodedResponse);
													}

													this.setEntryType(newEntryId, dc, filter);
												}
											});
								} else {
									this.setEntryType(newEntryId, dc, filter);
								}
							}
						},

						onCardSelected : function onCardSelected(card) {
							this.setCard(card);
						},

						/**
						 * @param {Number}
						 *            entryTypeId
						 * @param {Object}
						 *            dc
						 * @param {String}
						 *            filter
						 */
						setEntryType : function(entryTypeId, dc, filter) {
							this.entryType = _CMCache.getEntryTypeById(entryTypeId);
							this.setCard(null); // Reset selected card
							this.callForSubControllers('onEntryTypeSelected', [ this.entryType, dc, filter ]);

							if (!Ext.isEmpty(dc) && !Ext.isEmpty(dc.activateFirstTab))
								this.view.cardTabPanel.activeTabSet(dc.activateFirstTab);
						},

						getEntryType : function() {
							return this.entryType || null;
						},

						getEntryTypeId : function() {
							var id = null;
							if (this.entryType) {
								id = this.entryType.get('id');
							}

							return id;
						},

						setCard : function(card) {
							this.card = card;
							this.onCardChanged(card);
						},

						getCard : function() {
							return this.card;
						},

						// private, called from setCard. Implement different
						// behaviours in subclasses
						onCardChanged : function(card) {
							this.callForSubControllers('onCardSelected', this.card);
						},

						// private, call a given function for all the
						// subcontrolles, and
						// pass the arguments to them.
						callForSubControllers : function(fnName, params) {
							for (var i = 0, l = this.subControllers.length, ct = null; i < l; ++i) {
								ct = this.subControllers[i];
								if (typeof fnName == 'string' && typeof ct[fnName] == 'function') {

									params = Ext.isArray(params) ? params : [ params ];
									ct[fnName].apply(ct, params);
								}
							}
						},

						/**
						 * @abstract
						 */
						buildSubControllers : Ext.emptyFn
					});

	Ext
			.define(
					'CMDBuild.controller.management.classes.CMModCardController',
					{
						extend : 'CMDBuild.controller.management.common.CMModController',

						/**
						 * @property {Ext.data.Model}
						 */
						card : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.CMCardPanelController}
						 */
						cardPanelController : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.CMMapController}
						 */
						controllerMap : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.panel.form.tabs.Attachment}
						 */
						controllerTabAttachment : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.tabs.Email}
						 */
						controllerTabEmail : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.tabs.History}
						 */
						controllerTabHistory : undefined,

						/**
						 * @cfg {Boolean}
						 */
						enableNewCardModule : true,

						/**
						 * @property {CMDBuild.controller.management.classes.masterDetails.CMMasterDetailsController}
						 */
						mdController : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.CMNoteController}
						 */
						noteController : undefined,

						/**
						 * @property {CMDBuild.controller.management.classes.CMCardRelationsController}
						 */
						relationsController : undefined,

						/**
						 * @property {Array}
						 */
						subControllers : [],

						/**
						 * @property {CMDBuild.view.management.classes.CMModCard}
						 */
						view : undefined,

						/**
						 * @param {CMDBuild.view.management.classes.CMModCard}
						 *            view
						 * 
						 * @override
						 */
						constructor : function(view) {
							this.callParent(arguments);

							this.mon(this.view, this.view.CMEVENTS.addButtonClick, onAddCardButtonClick, this);
						},

						/**
						 * Build all controllers and adds view in tab panel with
						 * controller declaration order
						 * 
						 * @override
						 */
						buildSubControllers : function() {
							Ext.suspendLayouts();

							// Tabs controllers (sorted)
							this.enableNewCardModule ? this.buildTabControllerCard2() : this.buildTabControllerCard(); // New
							// card
							// panel
							// or
							// old
							// one?
							this.buildTabControllerDetails();
							this.buildTabControllerNotes();
							this.buildTabControllerRelations();
							this.buildTabControllerHistory();
							this.buildTabControllerEmail();
							this.buildTabControllerAttachments();

							// Generic controllers
							buildGridController(this, this.view.getGrid());
							buildBimController(this, this.view.getGrid());

							Ext.resumeLayouts();

							this.view.cardTabPanel.setActiveTab(0);
						},

						buildMapController : function() {
							if (Ext.isFunction(this.view.getMapPanel)) {
								this.controllerMap = new CMDBuild.controller.management.classes.CMMapController(
										this.view.getMapPanel(), this.view.getMapPanel().interactionDocument);
							} else { // FIXME: ugly code style, build fake
								// map controller
								this.controllerMap = {
									onEntryTypeSelected : Ext.emptyFn,
									onAddCardButtonClick : Ext.emptyFn,
									onCardSaved : Ext.emptyFn,
									getCardData : Ext.emptyFn,
									getValues : function() {
										return false;
									},
									refresh : Ext.emptyFn,
									editMode : Ext.emptyFn,
									displayMode : Ext.emptyFn
								};
							}

							this.subControllers.push(this.controllerMap);

							if (!this.enableNewCardModule)
								this.cardPanelController.addCardDataProviders(this.controllerMap);
						},

						buildTabControllerAttachments : function() {
							if (!CMDBuild.configuration.userInterface
									.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_ATTACHMENT_TAB)) {
								this.controllerTabAttachment = Ext.create(
										'CMDBuild.controller.management.classes.panel.form.tabs.Attachment', {
											parentDelegate : this
										});

								this.subControllers.push(this.controllerTabAttachment);

								this.view.cardTabPanel.attachmentPanel = this.controllerTabAttachment.getView(); // Creates
								// tabPanel
								// object

								this.view.cardTabPanel.add(this.controllerTabAttachment.getView()); // Add
								// panel
								// to
								// view
							}
						},

						buildTabControllerCard : function() {
							var view = this.view.getCardPanel();
							var widgetControllerManager = new CMDBuild.controller.management.common.CMWidgetManagerController(
									this.view.getWidgetManager());

							if (!Ext.isEmpty(view)) {
								this.cardPanelController = new CMDBuild.controller.management.classes.CMCardPanelController(
										view, this, widgetControllerManager);

								this.mon(this.cardPanelController, this.cardPanelController.CMEVENTS.cardRemoved,
										function(idCard, idClass) {
											var et = _CMCardModuleState.entryType;

											this.gridController.onCardDeleted();
											this.view.reset(et.get('id')); // TODO
											// change
											// to
											// notify
											// the
											// sub-controllers

											_CMCache.onClassContentChanged(idClass);
										}, this);

								this.mon(this.cardPanelController, this.cardPanelController.CMEVENTS.cardSaved,
										function(cardData) {
											var et = _CMCardModuleState.entryType;

											this.gridController.onCardSaved(cardData);
											this.controllerMap.onCardSaved(cardData);

											_CMCache.onClassContentChanged(et.get('id'));
										}, this);

								this.mon(this.cardPanelController,
										this.cardPanelController.CMEVENTS.displayModeDidActivate, function() {
											this.controllerMap.displayMode();
										}, this);

								this.mon(this.cardPanelController, this.cardPanelController.CMEVENTS.cloneCard,
										function() {
											this.callForSubControllers('onCloneCard');
										}, this);

								this.subControllers.push(this.cardPanelController);

								this.view.cardTabPanel.add(view); // Add panel
								// to view
							}
						},

						buildTabControllerCard2 : function() {
							this.controllerTabCard2 = Ext.create(
									'CMDBuild.controller.management.classes.panel.form.tabs.card.Tab', {
										parentDelegate : this
									});

							this.subControllers.push(this.controllerTabCard2);

							this.view.cardTabPanel.cardPanel2 = this.controllerTabCard2.getView(); // Creates
							// tabPanel
							// object

							this.view.cardTabPanel.add(this.controllerTabCard2.getView()); // Add
							// panel
							// to
							// view
						},

						buildTabControllerDetails : function() {
							var view = this.view.getMDPanel();

							if (!Ext.isEmpty(view)) {
								this.mdController = new CMDBuild.controller.management.classes.masterDetails.CMMasterDetailsController(
										view, this);

								this.mon(this.mdController, 'empty', function(isVisible) {
									if (isVisible)
										this.view.cardTabPanel.activateFirstTab();
								}, this);

								this.subControllers.push(this.mdController);

								this.view.cardTabPanel.add(view); // Add panel
								// to view
							}
						},

						buildTabControllerEmail : function() {
							if (!CMDBuild.configuration.userInterface
									.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_EMAIL_TAB)) {
								this.controllerTabEmail = Ext.create(
										'CMDBuild.controller.management.classes.tabs.Email', {
											parentDelegate : this
										});

								this.subControllers.push(this.controllerTabEmail);

								this.view.cardTabPanel.emailPanel = this.controllerTabEmail.getView(); // Creates
								// tabPanel
								// object

								this.view.cardTabPanel.add(this.controllerTabEmail.getView());
							}
						},

						buildTabControllerHistory : function() {
							if (!CMDBuild.configuration.userInterface
									.isDisabledCardTab(CMDBuild.core.constants.Proxy.CLASS_HISTORY_TAB)) {
								this.controllerTabHistory = Ext.create(
										'CMDBuild.controller.management.classes.tabs.History', {
											parentDelegate : this
										});

								this.subControllers.push(this.controllerTabHistory);

								this.view.cardTabPanel.cardHistoryPanel = this.controllerTabHistory.getView(); // Creates
								// tabPanel
								// object

								this.view.cardTabPanel.add(this.controllerTabHistory.getView());
							}
						},

						buildTabControllerNotes : function() {
							var view = this.view.getNotePanel();

							if (!Ext.isEmpty(view)) {
								this.noteController = new CMDBuild.controller.management.classes.CMNoteController(view);

								this.subControllers.push(this.noteController);

								this.view.cardTabPanel.add(view); // Add panel
								// to view
							}
						},

						buildTabControllerRelations : function() {
							var view = this.view.getRelationsPanel();

							if (!Ext.isEmpty(view)) {
								this.relationsController = new CMDBuild.controller.management.classes.CMCardRelationsController(
										view, this);

								this.mon(this.relationsController,
										this.relationsController.CMEVENTS.serverOperationSuccess, function() {
											this.gridController.reload(true);
										}, this);

								this.subControllers.push(this.relationsController);

								this.view.cardTabPanel.add(view); // Add panel
								// to view
							}
						},

						/**
						 * @param {Number}
						 *            classId
						 */
						changeClassUIConfigurationForGroup : function(classId) {
							var privileges = _CMUtils.getClassPrivileges(classId);

							this.view.addCardButton.disabledForGroup = !(privileges.write && !privileges.crudDisabled.create);

							if (this.view.addCardButton.disabledForGroup) {
								this.view.addCardButton.disable();
							} else {
								this.view.addCardButton.enable();
							}

							if (!this.enableNewCardModule)
								this.cardPanelController.changeClassUIConfigurationForGroup(
										!(privileges.write && !privileges.crudDisabled.modify),
										!(privileges.write && !privileges.crudDisabled.clone),
										!(privileges.write && !privileges.crudDisabled.remove));
						},

						/**
						 * Returns geometries to save with card
						 * 
						 * @param {Object}
						 *            parameters
						 * @param {Number}
						 *            parameters.cardId
						 * @param {String}
						 *            parameters.className
						 * 
						 * @returns {Object} mapSaveParams
						 * 
						 * @legacy
						 * @public
						 */
						getMapSaveParams : function(parameters) {
							parameters = Ext.isObject(parameters) ? parameters : {};

							var mapSaveParams = {};

							if (CMDBuild.configuration.gis.get(CMDBuild.core.constants.Proxy.ENABLED)
									&& Ext.isString(parameters.className) && !Ext.isEmpty(parameters.className)) {
								var mapData = this.controllerMap.getCardData(parameters);
								if (mapData) {
									mapSaveParams[this.controllerMap.cardDataName] = mapData;
								}
							}

							return mapSaveParams;
						},

						/**
						 * @returns {Ext.form.Basic or null}
						 */
						getFormForTemplateResolver : function() {
							return this.view.getCardPanel().getFormForTemplateResolver();
						},

						/**
						 * To clear view if there are no loaded records
						 * 
						 * @param {Array}
						 *            args
						 * @param {CMDBuild.core.cache.Store}
						 *            args[0]
						 * @param {Array}
						 *            args[1] - loaded records array
						 * @param {Boolean}
						 *            args[2]
						 * 
						 * @returns {Void}
						 */
						onGridLoad : function(args) {
							// TODO notify to sub-controllers?
							if (Ext.isEmpty(args[1])) {
								this.view.cardTabPanel.items.each(function(item) {
									if (Ext.isFunction(item.reset))
										item.reset();

									if (Ext.isFunction(item.disable))
										item.disable();
								});

								if (!this.enableNewCardModule) {
									this.view.getCardPanel().enable();
									this.view.getCardPanel().displayMode();
									CMDBuild.clearComponent(this.view.getCardPanel().form);
								}
							}
						},

						onGridVisible : function(visible, selection) {
							if (visible && this.entryType && this.card && selection && selection[0]
									&& selection[0].get('Id') != this.card.get('Id')) {
								this.gridController.openCard({
									IdClass : this.entryType.get('id'),
									Id : this.card.get('Id')
								}, true);
							}
						},

						/**
						 * Forward onAbortCardClick event to email tab
						 * controller
						 */
						onAbortCardClick : function() {
							if (!Ext.isEmpty(this.controllerTabEmail)
									&& Ext.isFunction(this.controllerTabEmail.onAbortCardClick))
								this.controllerTabEmail.onAbortCardClick();
						},

						/**
						 * Forward onModifyCardClick event to email tab
						 * controller
						 */
						onModifyCardClick : function() {
							if (!Ext.isEmpty(this.controllerMap) && Ext.isFunction(this.controllerMap.editMode))
								this.controllerMap.editMode();

							if (!Ext.isEmpty(this.controllerTabEmail)
									&& Ext.isFunction(this.controllerTabEmail.onModifyCardClick))
								this.controllerTabEmail.onModifyCardClick();
						},

						/**
						 * Forward onSaveCardClick event to email tab controller
						 */
						onSaveCardClick : function() {
							if (!Ext.isEmpty(this.controllerTabEmail)
									&& Ext.isFunction(this.controllerTabEmail.onSaveCardClick))
								this.controllerTabEmail.onSaveCardClick();
						},

						/**
						 * Bind the CMCardModuleState
						 * 
						 * @param {Number}
						 *            entryTypeId
						 * @param {Object}
						 *            dc
						 * @param {String}
						 *            filter
						 * 
						 * @override
						 */
						setEntryType : function(entryTypeId, dc, filter) {
							var entryType = _CMCache.getEntryTypeById(entryTypeId);

							this.view.addCardButton.updateForEntry(entryType);
							this.view.mapAddCardButton.updateForEntry(entryType);
							this.view.updateTitleForEntry(entryType);

							if (!Ext.isEmpty(dc) && !Ext.isEmpty(dc.activateFirstTab))
								this.view.cardTabPanel.activeTabSet(dc.activateFirstTab);

							_CMCardModuleState.setEntryType(entryType, dc, filter);
							_CMUIState.onlyGridIfFullScreen();

							this.changeClassUIConfigurationForGroup(entryTypeId);

							// FIXME: hack to temporary fix DataView bug
							if (Ext.isString(filter)
									&& !Ext.isEmpty(filter)
									&& Ext.Array.contains(this.selectedAccordionNode
											.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY), 'filter')) {
								CMDBuild.global.dataViewHack = {
									filter : filter,
									entryType : entryType
								};
							}
						}
					});

	function buildGridController(me, grid) {
		if (grid) {
			me.gridController = new CMDBuild.controller.management.common.CMCardGridController(grid);
			me.mon(me.gridController, me.gridController.CMEVENTS.cardSelected, me.onCardSelected, me);
			me.mon(me.gridController, me.gridController.CMEVENTS.wrongSelection, onSelectionWentWrong, me);
			me.mon(me.gridController, me.gridController.CMEVENTS.gridVisible, me.onGridVisible, me);
			me.mon(me.gridController, me.gridController.CMEVENTS.load, me.onGridLoad, me);
			me.mon(me.gridController, me.gridController.CMEVENTS.itemdblclick, function() {
				if (me.enableNewCardModule) {
					if (!me.controllerTabCard2
							.cmfg('panelGridAndFormSelectedEntityGet', [ CMDBuild.core.constants.Proxy.CAPABILITIES,
									CMDBuild.core.constants.Proxy.MODIFY_DISABLED ])) {
						var params = {};
						params[CMDBuild.core.constants.Proxy.FULL_SCREEN] = 'bottom';
						params[CMDBuild.core.constants.Proxy.VIEW_MODE] = 'edit';

						if (!me.controllerTabCard2.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
							params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = me.controllerTabCard2.cmfg(
									'classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

						if (!me.controllerTabCard2.cmfg('classesFormTabCardSelectedItemIsEmpty')) {
							params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = me.controllerTabCard2.cmfg(
									'classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
							params[CMDBuild.core.constants.Proxy.ITEM_ID] = me.controllerTabCard2.cmfg(
									'classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
						}

						me.controllerTabCard2.cmfg('classesFormTabCardUiUpdate', params);
					}
				} else {
					var privileges = _CMUtils.getEntryTypePrivilegesByCard(me.cardPanelController.card);
					if (!privileges.crudDisabled.modify) {
						me.cardPanelController.onModifyCardClick();
						_CMUIState.onlyFormIfFullScreen();
					}
				}
			}, me);

			me.subControllers.push(me.gridController);
		}
	}

	function buildBimController(me, view) {
		if (view == null) {
			return;
		}

		if (CMDBuild.configuration.bim.get('enabled')) { // TODO: use proxy
			// constants
			new CMDBuild.bim.management.CMBimController(view);
		}
	}

	function onSelectionWentWrong() {
		this.view.cardTabPanel.reset(_CMCardModuleState.entryType.get('id'));
	}

	function onAddCardButtonClick(p) {
		this.setCard(null);
		this.callForSubControllers('onAddCardButtonClick', p.classId);
		this.view.activateFirstTab();

		_CMUIState.onlyFormIfFullScreen();
	}

})();
