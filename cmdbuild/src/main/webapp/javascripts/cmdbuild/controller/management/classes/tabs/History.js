(function () {

	/**
	 * @link CMDBuild.controller.management.workflow.panel.form.tabs.History
	 */
	Ext.define('CMDBuild.controller.management.classes.tabs.History', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		uses: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.classes.tabs.History'
		],

		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
		 */
		parentDelegate: undefined,

		/**
		 * Attributes to hide from selected card object
		 *
		 * @cfg {Array}
		 *
		 * @private
		 */
		attributesKeysToFilter: [
			'Id',
			'IdClass',
			'IdClass_value',
			CMDBuild.core.constants.Proxy.BEGIN_DATE,
			CMDBuild.core.constants.Proxy.CLASS_NAME,
			CMDBuild.core.constants.Proxy.ID,
			CMDBuild.core.constants.Proxy.USER
		],

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesTabHistorySelectedCardIsEmpty',
			'onClassesTabHistoryPanelShow = onClassesTabHistoryIncludeRelationCheck', // Reloads store to be consistent with includeRelationsCheckbox state
			'onClassesTabHistoryRowExpand'
		],

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		entryTypeAttributes: {},

		/**
		 * @property {CMDBuild.view.management.classes.tabs.history.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.classes.tabs.history.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @param {CMDBuild.model.classes.tabs.history.SelectedClass}
		 *
		 * @private
		 */
		selectedClass: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.tabs.history.HistoryView}
		 */
		view: undefined,

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

			this.view = Ext.create('CMDBuild.view.management.classes.tabs.history.HistoryView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;

			this.buildCardModuleStateDelegate();
		},

		/**
		 * Adds current card to history store for a better visualization of differences from last history record and current one. As last function called on store build
		 * collapses all rows on store load.
		 *
		 * Implemented with ugly workarounds because server side ugly code.
		 *
		 * TODO: should be better to refactor this method when a getCard service will returns a better model of card data
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		addCurrentCardToStore: function () {
			var selectedEntityAttributes = {};
			var selectedEntityMergedData = this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.VALUES);

			// Filter card's values to don't display unwanted data
			Ext.Object.each(selectedEntityMergedData, function (key, value, myself) {
				if (!Ext.Array.contains(this.attributesKeysToFilter, key) && key.indexOf('_') != 0)
					selectedEntityAttributes[key] = value;
			}, this);

			this.valuesFormattingAndCompare(selectedEntityAttributes); // Formats values only

			var currentCardObject = this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.VALUES);
			currentCardObject[CMDBuild.core.constants.Proxy.ID] = this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.ID);
			currentCardObject[CMDBuild.core.constants.Proxy.VALUES] = selectedEntityAttributes;

			this.clearStoreAdd(Ext.create('CMDBuild.model.classes.tabs.history.CardRecord', currentCardObject));

			this.getRowExpanderPlugin().collapseAll();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildCardModuleStateDelegate: function () {
			var me = this;

			this.cardStateDelegate = new CMDBuild.state.CMCardModuleStateDelegate();

			this.cardStateDelegate.onEntryTypeDidChange = function (state, entryType) {
				me.onEntryTypeSelected(entryType);
			};

			this.cardStateDelegate.onCardDidChange = function (state, card) {
				Ext.suspendLayouts();
				me.onCardSelected(card);
				Ext.resumeLayouts();
			};

			_CMCardModuleState.addDelegate(this.cardStateDelegate);

			if (!Ext.isEmpty(this.view))
				this.mon(this.view, 'destroy', function (view) {
					_CMCardModuleState.removeDelegate(this.cardStateDelegate);

					delete this.cardStateDelegate;
				}, this);
		},

		/**
		 * Clear store and re-add all records to avoid RowExpander plugin bug that appens with store add action that won't manage correctly expand/collapse events
		 *
		 * @param {Array or Object} itemsToAdd
		 *
		 * @returns {Void}
		 */
		clearStoreAdd: function (itemsToAdd) {
			var _store = this.grid.getStore(); 
			var oldStoreDatas = _store.getRange();
			
			_store.removeAll()
			_store.add(itemsToAdd)
			_store.add(oldStoreDatas)
		},

		/**
		 * @param {CMDBuild.model.classes.tabs.history.RelationRecord} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		currentCardRowExpand: function (record) {
			var predecessorRecord = this.getRecordPredecessor(record);
			var selectedEntityAttributes = {};
			var selectedEntityMergedData = this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.VALUES);

			// Filter card's values to don't display unwanted data
			Ext.Object.each(selectedEntityMergedData, function (key, value, myself) {
				if (!Ext.Array.contains(this.attributesKeysToFilter, key) && key.indexOf('_') != 0)
					selectedEntityAttributes[key] = value;
			}, this);

			if (!Ext.isEmpty(predecessorRecord)) {
				var predecessorParams = {};
				predecessorParams[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
				predecessorParams[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.management.classes.tabs.History.readHistoric({
					params: predecessorParams,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.valuesFormattingAndCompare(selectedEntityAttributes, decodedResponse.response[CMDBuild.core.constants.Proxy.VALUES]);

						// Setup record property with historic card details to use XTemplate functionalities to render
						record.set(CMDBuild.core.constants.Proxy.VALUES, selectedEntityAttributes);
					}
				});
			}
		},

		/**
		 * Finds same type (card or relation) current record predecessor
		 *
		 * @param {CMDBuild.model.classes.tabs.history.CardRecord or CMDBuild.model.classes.tabs.history.RelationRecord} record
		 *
		 * @returns {CMDBuild.model.classes.tabs.history.CardRecord or CMDBuild.model.classes.tabs.history.RelationRecord} predecessor or null
		 *
		 * @private
		 */
		getRecordPredecessor: function (record) {
			var i = this.grid.getStore().indexOf(record) + 1;
			var predecessor = null;

			if (!Ext.isEmpty(record) && !Ext.isEmpty(this.grid.getStore())) {
				while (i < this.grid.getStore().getCount() && Ext.isEmpty(predecessor)) {
					var inspectedRecord = this.grid.getStore().getAt(i);

					if (
						!Ext.isEmpty(inspectedRecord)
						&& record.get(CMDBuild.core.constants.Proxy.IS_CARD) == inspectedRecord.get(CMDBuild.core.constants.Proxy.IS_CARD)
						&& record.get(CMDBuild.core.constants.Proxy.IS_RELATION) == inspectedRecord.get(CMDBuild.core.constants.Proxy.IS_RELATION)
					) {
						predecessor = inspectedRecord;
					}

					i = i + 1;
				}
			}

			return predecessor;
		},

		/**
		 * @returns {CMDBuild.view.management.classes.tabs.history.RowExpander} or null
		 *
		 * @private
		 */
		getRowExpanderPlugin: function () {
			var rowExpanderPlugin = null;

			if (
				!Ext.isEmpty(this.grid)
				&& !Ext.isEmpty(this.grid.plugins) && Ext.isArray(this.grid.plugins)
			) {
				Ext.Array.forEach(this.grid.plugins, function (plugin, i, allPlugins) {
					if (plugin instanceof Ext.grid.plugin.RowExpander)
						rowExpanderPlugin = plugin;
				});
			}

			return rowExpanderPlugin;
		},

		/**
		 * @returns {Void}
		 *
		 * @public
		 */
		onAddCardButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @param {Object} card
		 *
		 * @returns {Void}
		 *
		 * @public
		 *
		 * FIXME: should be removed on complete refactor
		 */
		onCardSelected: function (card) {
			if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
				var requiredClassId = card.get('IdClass');

				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = requiredClassId;

				CMDBuild.proxy.management.classes.tabs.History.readClassById({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							this.classesTabHistorySelectedClassSet({ value: decodedResponse });
							this.classesTabHistorySelectedCardSet({ value: card.getData() });

							if (
								!this.classesTabHistorySelectedClassIsEmpty()
								&& this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.TABLE_TYPE) != CMDBuild.core.constants.Global.getTableTypeSimpleTable() // SimpleTables hasn't history
							) {
								this.view.setDisabled(this.cmfg('classesTabHistorySelectedCardIsEmpty'));
							}

							this.cmfg('onClassesTabHistoryPanelShow');
						} else {
							_error('onCardSelected(): class not found', this, requiredClassId);
						}
					}
				});
			}
		},

		/**
		 * @param {CMDBuild.model.classes.tabs.history.CardRecord or CMDBuild.model.classes.tabs.history.RelationRecord} record
		 *
		 * @returns {Void}
		 */
		onClassesTabHistoryRowExpand: function (record) {
			if (!Ext.isEmpty(record)) {
				var params = {};

				if (record.get(CMDBuild.core.constants.Proxy.IS_CARD)) { // Card row expand
					if (this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.ID) == record.get(CMDBuild.core.constants.Proxy.ID)) { // Expanding current card
						this.currentCardRowExpand(record);
					} else {
						params[CMDBuild.core.constants.Proxy.CARD_ID] = record.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
						params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.NAME);

						CMDBuild.proxy.management.classes.tabs.History.readHistoric({ // Get expanded card data
							params: params,
							scope: this,
							success: function (response, options, decodedResponse) {
								var cardValuesObject = decodedResponse.response[CMDBuild.core.constants.Proxy.VALUES];
								var predecessorRecord = this.getRecordPredecessor(record);

								if (!Ext.isEmpty(predecessorRecord)) {
									var predecessorParams = {};
									predecessorParams[CMDBuild.core.constants.Proxy.CARD_ID] = predecessorRecord.get(CMDBuild.core.constants.Proxy.ID); // Historic card ID
									predecessorParams[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.NAME);

									CMDBuild.proxy.management.classes.tabs.History.readHistoric({ // Get expanded predecessor's card data
										params: predecessorParams,
										scope: this,
										success: function (response, options, decodedResponse) {
											decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

											this.valuesFormattingAndCompare(cardValuesObject, decodedResponse[CMDBuild.core.constants.Proxy.VALUES]);

											// Setup record property with historic card details to use XTemplate functionalities to render
											record.set(CMDBuild.core.constants.Proxy.VALUES, cardValuesObject);
										}
									});
								} else {
									this.valuesFormattingAndCompare(cardValuesObject); // Formats values only

									// Setup record property with historic card details to use XTemplate functionalities to render
									record.set(CMDBuild.core.constants.Proxy.VALUES, cardValuesObject);
								}
							}
						});
					}
				} else { // Relation row expand
					params[CMDBuild.core.constants.Proxy.ID] = record.get(CMDBuild.core.constants.Proxy.ID); // Historic relation ID
					params[CMDBuild.core.constants.Proxy.DOMAIN] = record.get(CMDBuild.core.constants.Proxy.DOMAIN);

					CMDBuild.proxy.management.classes.tabs.History.readHistoricRelation({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

							// Setup record property with historic relation details to use XTemplate functionalities to render
							record.set(CMDBuild.core.constants.Proxy.VALUES, this.valuesFormattingAndCompareRelation(decodedResponse)); // Formats values only
						}
					});
				}
			}
		},

		/**
		 * Loads store and if includeRelationsCheckbox is checked fills store with relations rows
		 *
		 * @returns {Void}
		 */
		onClassesTabHistoryPanelShow: function () {
			if (this.view.isVisible()) {
				// History record save
				if (!Ext.isEmpty(_CMCardModuleState.entryType) && !Ext.isEmpty(_CMCardModuleState.card))
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: 'class',
						entryType: {
							description: _CMCardModuleState.entryType.get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMCardModuleState.entryType.get(CMDBuild.core.constants.Proxy.ID),
							object: _CMCardModuleState.entryType
						},
						item: {
							description: _CMCardModuleState.card.get('Description') || _CMCardModuleState.card.get('Code'),
							id: _CMCardModuleState.card.get('Id'),
							object: _CMCardModuleState.card
						},
						section: {
							description: this.view.title,
							object: this.view
						}
					});

				this.grid.getStore().removeAll(); // Clear store before load new one

				if (!this.cmfg('classesTabHistorySelectedCardIsEmpty')) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.NAME);

					// Request all class attributes
					CMDBuild.proxy.management.classes.tabs.History.readAttributes({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

							Ext.Array.forEach(decodedResponse, function (attribute, i, allAttributes) {
								if (attribute['fieldmode'] != 'hidden')
									this.entryTypeAttributes[attribute[CMDBuild.core.constants.Proxy.NAME]] = attribute;
							}, this);

							params = {};
							params[CMDBuild.core.constants.Proxy.CARD_ID] = this.classesTabHistorySelectedCardGet(CMDBuild.core.constants.Proxy.ID);
							params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.classesTabHistorySelectedClassGet(CMDBuild.core.constants.Proxy.NAME);

							this.grid.getStore().load({
								params: params,
								scope: this,
								callback: function (records, operation, success) {
									this.getRowExpanderPlugin().collapseAll();

									if (this.grid.includeRelationsCheckbox.getValue()) {
										CMDBuild.proxy.management.classes.tabs.History.readRelations({
											params: params,
											loadMask: false,
											scope: this,
											success: function (response, options, decodedResponse) {
												decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];
												decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ELEMENTS];

												var referenceElementsModels = [];

												// Build reference models
												Ext.Array.forEach(decodedResponse, function (element, i, allElements) {
													referenceElementsModels.push(Ext.create('CMDBuild.model.classes.tabs.history.RelationRecord', element));
												});

												this.clearStoreAdd(referenceElementsModels);

												this.addCurrentCardToStore();
											}
										});
									} else {
										this.addCurrentCardToStore();
									}
								}
							});
						}
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @public
		 */
		onCloneCard: function () {
			this.view.disable();
		},

		/**
		 * @param {CMDBuild.cache.CMEntryTypeModel} entryType
		 *
		 * @returns {Void}
		 *
		 * @public
		 *
		 * FIXME: should be removed on complete refactor (will be replaced from tab show event)
		 */
		onEntryTypeSelected: function (entryType) {
			this.view.disable();
		},

		/**
		 * SelectedCard property functions
		 *
		 * FIXME: move to parentDelegate on refactor
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabHistorySelectedCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesTabHistorySelectedCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 * @param {String} parameters.propertyName
			 * @param {Object} parameters.value
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabHistorySelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.classes.tabs.history.SelectedCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * SelectedClass property functions
		 *
		 * FIXME: move to parentDelegate on refactor
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabHistorySelectedClassGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedClass';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			classesTabHistorySelectedClassIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedClass';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabHistorySelectedClassSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.classes.tabs.history.SelectedClass';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedClass';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * If value1 is different than value2 modified is true, false otherwise. Strips also HTML tags from "description".
		 *
		 * @param {Object} object1 - currently expanded record
		 * @param {Object} object2 - predecessor record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		valuesFormattingAndCompare: function (object1, object2) {
			object1 = object1 || {};
			object2 = object2 || {};

			if (!Ext.isEmpty(object1) && Ext.isObject(object1)) {
				Ext.Object.each(object1, function (key, value, myself) {
					var changed = false;

					// Get attribute's index and description
					var attributeDescription = Ext.isEmpty(this.entryTypeAttributes[key]) ? null : this.entryTypeAttributes[key][CMDBuild.core.constants.Proxy.DESCRIPTION];
					var attributeIndex = Ext.isEmpty(this.entryTypeAttributes[key]) ? 0 : this.entryTypeAttributes[key][CMDBuild.core.constants.Proxy.INDEX];

					// Build object1 properties models
					var attributeValues = Ext.isObject(value) ? value : { description: value };
					attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeDescription;
					attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeIndex;

					object1[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);

					// Build object2 properties models
					if (!Ext.Object.isEmpty(object2)) {
						if (!object2.hasOwnProperty(key))
							object2[key] = null;

						attributeValues = Ext.isObject(object2[key]) ? object2[key] : { description: object2[key] };
						attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeDescription;
						attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeIndex;

						object2[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);
					}

					changed = Ext.Object.isEmpty(object2) ? false : !Ext.Object.equals(object1[key].getData(), object2[key].getData());

					object1[key].set(CMDBuild.core.constants.Proxy.CHANGED, changed);
				}, this);
			}
		},

		/**
		 * @param {Object} relationObject
		 *
		 * @returns {Object} formattedObject
		 *
		 * @private
		 */
		valuesFormattingAndCompareRelation: function (relationObject) {
			var formattedObject = {};

			if (Ext.isObject(relationObject) && !Ext.Object.isEmpty(relationObject)) {
				formattedObject[CMDBuild.core.constants.Proxy.DOMAIN] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.domain,
					description: relationObject[CMDBuild.core.constants.Proxy.DOMAIN],
					index: 0
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.classLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CLASS],
					index: 1
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.code,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_CODE],
					index: 2
				});
				formattedObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', {
					attributeDescription: CMDBuild.Translation.descriptionLabel,
					description: relationObject[CMDBuild.core.constants.Proxy.DESTINATION_DESCRIPTION],
					index: 3
				});

				// Merge values property to object
				Ext.Object.each(relationObject[CMDBuild.core.constants.Proxy.VALUES], function (key, value, myself) {
					// Get attribute's index and description
					var attributeDescription = Ext.isEmpty(this.entryTypeAttributes[key]) ? null : this.entryTypeAttributes[key][CMDBuild.core.constants.Proxy.DESCRIPTION];
					var attributeIndex = Ext.isEmpty(this.entryTypeAttributes[key]) ? 0 : this.entryTypeAttributes[key][CMDBuild.core.constants.Proxy.INDEX];

					// Build object1 properties models
					var attributeValues = Ext.isObject(value) ? value : { description: value };
					attributeValues[CMDBuild.core.constants.Proxy.ATTRIBUTE_DESCRIPTION] = attributeDescription;
					attributeValues[CMDBuild.core.constants.Proxy.INDEX] = attributeIndex;

					formattedObject[key] = Ext.create('CMDBuild.model.common.tabs.history.Attribute', attributeValues);
				}, this);
			}

			return Ext.Object.isEmpty(formattedObject) ? relationObject : formattedObject;
		}
	});

})();
