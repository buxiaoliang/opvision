(function () {

	Ext.define('CMDBuild.controller.management.widget.createModifyCard.CMCreateModifyCardController', {
		extend: 'CMDBuild.controller.common.abstract.Widget',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.widget.CreateModifyCard'
		],

		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Ext.data.Model or CMDBuild.model.CMActivityInstance}
		 */
		card: undefined,

		/**
		 * @cfg {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'isValid',
			'onBeforeSave',
			'onEditMode',
			'onWidgetCreateModifyCardSaveButtonClick',
			'widgetConfigurationGet = widgetCreateModifyCardConfigurationGet',
			'widgetConfigurationIsEmpty = widgetCreateModifyCardConfigurationIsEmpty',
			'widgetCreateModifyCardBeforeActiveView = beforeActiveView',
			'widgetCreateModifyCardBeforeHideView = beforeHideView',
			'widgetCreateModifyCardGetData = getData'
		],

		/**
		 * @property {CMDBuild.Management.TemplateResolver}
		 */
		templateResolver: undefined,

		/**
		 * @cfg {CMDBuild.view.management.widget.createModifyCard.CMCreateModifyCard}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.createModifyCard.Configuration',

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.common.CMWidgetManagerController} configurationObject.parentDelegate
		 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} configurationObject.card
		 * @param {Ext.form.Basic} configurationObject.clientForm
		 * @param {CMDBuild.view.management.widget.createModifyCard.CMCreateModifyCard} configurationObject.view
		 * @param {Object} configurationObject.widgetConfiguration
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.mixins.observable.constructor.call(this, arguments);

			this.card = null;
			this.savedCardId = undefined;
			this.templateResolverIsBusy = false;

			var ev = this.view.CMEVENTS;

			this.CMEVENTS = {
				editModeDidAcitvate: ev.editModeDidAcitvate,
				displayModeDidActivate: ev.displayModeDidActivate
			};

			this.relayEvents(this.view, [ev.editModeDidAcitvate, ev.displayModeDidActivate]);

			this.mon(this.view.addCardButton, 'cmClick', this.onAddCardClick, this);

			this.templateResolver = new CMDBuild.Management.TemplateResolver({
				clientForm: this.clientForm,
				xaVars: this.widgetConfiguration,
				serverVars: this.getTemplateResolverServerVars()
			});
		},

		/**
		 * Executed before view activation, loads fields and sets the cardId variable value
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		widgetCreateModifyCardBeforeActiveView: function () {
			this.card = null;
			this.entryType = _CMCache.getEntryTypeByName(this.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.TARGET_CLASS));

			// Deferred function to avoid bug that won't fill window form first time that window is displayed
			Ext.defer(function () {
				if (this.entryType != null) {
					if (this.entryType.isSuperClass()) {
						this.view.addCardButton.updateForEntry(this.entryType);
						this.view.addCardButton.setDisabled(this.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.READ_ONLY));
					} else {
						this.view.addCardButton.disable();
					}

					this.templateResolver.resolveTemplates({
						attributes: ['idcardcqlselector'],
						scope: this,
						callback: function (out, ctx) {
							this.cardId = normalizeIdCard(out['idcardcqlselector']);

							if (this.cardId == null && this.entryType.isSuperClass()) {
								// could not add a card for a superclass
							} else {
								this.loadAndFillFields();
							}
						}
					});
				}
			}, 10, this);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		widgetCreateModifyCardBeforeHideView: function () {
			this.unlockCard();
		},

		/**
		 * @returns {Object or null}
		 *
		 * @override
		 */
		widgetCreateModifyCardGetData: function () {
			var out = null;

			if (this.savedCardId) {
				out = {};
				out[CMDBuild.core.constants.Proxy.OUTPUT] = this.savedCardId;
			}

			return out;
		},

		onAddCardClick: function () {
			this.cardId = null;

			this.loadAndFillFields(this.entryType.getId());
		},

		/**
		 * @returns {Void}
		 */
		onWidgetCreateModifyCardSaveButtonClick: function () {
			if (thereAraNotWrongAttributes(this)) { // FIXME: should be used this.validate() method
				var params = this.view.getForm().getValues();
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.card.get('Id');
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.card.get('IdClass'));

				CMDBuild.proxy.management.widget.CreateModifyCard.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							this.view.displayMode();

							this.savedCardId = decodedResponse[CMDBuild.core.constants.Proxy.ID] || this.cardId;

							if (
								Ext.isObject(this.parentDelegate) && !Ext.Object.isEmpty(this.parentDelegate)
								&& Ext.isFunction(this.parentDelegate.hideWidgetsContainer)
							) {
								this.parentDelegate.hideWidgetsContainer();

								updateLocalDepsIfReferenceToModifiedClass(this);
							}
						}
					}
				});
			}
		},

		/**
		 * @param {Mixed} id
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		loadFields: function (id, callback) {
			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(id);

			CMDBuild.proxy.management.widget.CreateModifyCard.readAttributes({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						var attributes = CMDBuild.core.Utils.objectArraySort(decodedResponse, CMDBuild.core.constants.Proxy.INDEX), // FIXME: should be done in sub-classes
							attributeMap = {};

						// Build attributeMap
						if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
							Ext.Array.forEach(attributes, function (attributeObject, i, allAttributeObjects) {
								if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
									attributeMap[attributeObject[CMDBuild.core.constants.Proxy.NAME]] = attributeObject;
							}, this);

						// Override attributes with model configuration values
						if (!this.cmfg('widgetCreateModifyCardConfigurationIsEmpty', CMDBuild.core.constants.Proxy.MODEL)) {
							var configurationModel = this.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.MODEL);

							attributes = [];

							if (Ext.isArray(configurationModel) && !Ext.isEmpty(configurationModel))
								Ext.Array.forEach(configurationModel, function (overrideObject, i, allOverrideObjects) {
									if (Ext.isObject(overrideObject) && !Ext.Object.isEmpty(overrideObject)) {
										var attributeName = overrideObject[CMDBuild.core.constants.Proxy.NAME],
											mergedAttributeObject = attributeMap[attributeName];

										if (Ext.isObject(mergedAttributeObject) && !Ext.Object.isEmpty(mergedAttributeObject)) {
											// Writable property manage
											if (Ext.isBoolean(overrideObject[CMDBuild.core.constants.Proxy.WRITABLE]))
												mergedAttributeObject['fieldmode'] = overrideObject[CMDBuild.core.constants.Proxy.WRITABLE] ? CMDBuild.core.constants.Proxy.WRITE : CMDBuild.core.constants.Proxy.READ;

											// Hidden property manage
											attributes.push(mergedAttributeObject);
										}
									}
								}, this);
						}

						this.view.fillForm(attributes, false);

						if (Ext.isFunction(callback))
							Ext.callback(callback, this);
					} else {
						_error('loadFields(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Boolean} loadRemoteData
		 * @param {Object} params
		 * @param {Function} cb
		 */
		loadCard: function (loadRemoteData, params, cb) {
			var me = this;
			var cardId;

			if (params) {
				cardId = params.Id || params.cardId;
			} else {
				cardId = me.card.get('Id');
			}

			if (cardId && cardId != '-1' && (loadRemoteData || me.view.hasDomainAttributes())) {
				if (!params) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.CARD_ID] = me.card.get('Id');
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(me.card.get('IdClass'));
				}

				CMDBuild.proxy.management.widget.CreateModifyCard.read({
					params: params,
					loadMask: this.view,
					success: function (result, options, decodedResult) {
						var data = decodedResult.card;

						if (me.card) {
							// Merge the data of the selected card with the remote data loaded from the server. The reason is that in the activity list
							// the card have data that are not returned from the server, so use the data already in the record. For activities, the privileges
							// returned from the server are of the class and not of the activity
							data = Ext.Object.merge((me.card.raw || me.card.data), data);
						}

						addRefenceAttributesToDataIfNeeded(decodedResult.referenceAttributes, data);
						var card = Ext.create('CMDBuild.DummyModel', data);

						(typeof cb == 'function') ? cb(card) : me.loadCardStandardCallBack(card);
					}
				});
			} else {
				me.loadCardStandardCallBack(me.card);
			}
		},

		loadCardStandardCallBack: function (card) {
			var me = this;
			this.card = card;

			this.loadFields(card.get('IdClass'), function () {
				me.view.loadCard(card, bothpanel = true);
				if (me.isEditable(card)) {
					me.view.editMode();
				}
			});
		},

		isEditable: function (card) {
			var privileges = _CMUtils.getEntryTypePrivilegesByCard(card);

			return privileges.create && !this.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.READ_ONLY);
		},

		setWidgetManager: function (wm) {
			this.widgetManager = wm;
		},

		/**
		 * @param {Function} success
		 */
		lockCard: function (success) {
			if (CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)) {
				if (
					this.card
					&& this.card.get('Id') >= 0 // Avoid lock on card create
				) {
					CMDBuild.proxy.management.widget.CreateModifyCard.lock({
						params: {
							id: this.card.get('Id')
						},
						loadMask: false,
						success: success
					});
				}
			} else {
				success();
			}
		},

		unlockCard: function () {
			if (CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK))
				if (
					this.card
					&& this.view.isInEditing()
					&& this.card.get('Id') >= 0 // Avoid unlock on card create
				) {
					CMDBuild.proxy.management.widget.CreateModifyCard.unlock({
						params: {
							id: this.card.get('Id')
						},
						loadMask: false
					});
				}
		},

		loadAndFillFields: function (classId) {
			classId = classId || this.entryType.getId();

			var me = this,
				isANewCard = this.cardId == null || this.cardId == 0;

			if (isANewCard) {
				var fields = this.clientForm.getFields(),
					presets = this.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.PRESETS);

				var values = {
					Id: -1, // to have a new card
					IdClass: classId
				}

				fields.each(function (field) {
					if (field._belongToEditableSubpanel && presets[field.name]) {
						var cardAttributeName = presets[field.name];
						var cardAttributePresetValue = field.getValue();

						if (typeof cardAttributePresetValue != 'undefined')
							values[cardAttributeName] = cardAttributePresetValue;
					}
				});

				this.card = new CMDBuild.DummyModel(values);
				this.loadCard();
			} else {
				this.card = new CMDBuild.DummyModel({ Id: this.cardId });

				this.lockCard(function () {
					me.loadCard(true, {
						cardId: me.cardId,
						className: _CMCache.getEntryTypeNameById(classId)
					});
				});
			}
		}
	});

	/**
	 * Copy "CMDBuild.controller.management.classes.StaticsController.getInvalidAttributeAsHTML"
	 *
	 * @param {Ext.form.Basic} form
	 *
	 * @returns {String or null} out
	 */
	function getInvalidAttributeAsHTML(form) {
		var invalidFields = getInvalidField(form);
		var out = null;

		if (!Ext.Object.isEmpty(invalidFields) && Ext.isObject(invalidFields)) {
			out = '';

			Ext.Object.each(invalidFields, function(name, field, myself) {
				if (!Ext.isEmpty(field)) {
					var fieldLabel = field.getFieldLabel();

					// Strip label required flag
					if (fieldLabel.indexOf(CMDBuild.core.constants.Global.getMandatoryLabelFlag()) == 0)
						fieldLabel = fieldLabel.replace(CMDBuild.core.constants.Global.getMandatoryLabelFlag(), '');

					out += '<li>' + fieldLabel + '</li>';
				}
			}, this);

			out = '<ul>' + out + '</ul>';
		}

		return out;
	}

	/**
	 * Copy "CMDBuild.controller.management.classes.StaticsController.getInvalidField"
	 *
	 * @param {Ext.form.Basic} form
	 *
	 * @returns {Object} invalidFieldsMap
	 */
	function getInvalidField(form) {
		var fieldsArray = form.getFields().getRange();
		var invalidFieldsMap = {};

		if (!Ext.isEmpty(fieldsArray) && Ext.isArray(fieldsArray))
			Ext.Array.each(fieldsArray, function(field, i, allFields) { // Validates all fields (display panel fields and edit panel fields)
				if ( // Avoid DisplayFields validation on classes
					Ext.getClassName(field) != 'CMDBuild.view.common.field.CMDisplayField'
					&& Ext.getClassName(field) != 'Ext.form.field.Display'
				) {
					if (Ext.isFunction(field.isValid) && !field.isValid()) {
						invalidFieldsMap[field.name] = field;
					} else if (!Ext.isEmpty(invalidFieldsMap[field.name])) {
						delete invalidFieldsMap[field.name];
					}
				}
			}, this);

		return invalidFieldsMap;
	}

	function thereAraNotWrongAttributes(me) {
		var form = me.view.getForm();
		var invalidAttributes = getInvalidAttributeAsHTML(form);
		if (invalidAttributes != null) {
			var msg = Ext.String.format('<p class=\'{0}\'>{1}</p>', CMDBuild.core.constants.Global.getErrorMsgCss(), CMDBuild.Translation.errors.invalid_attributes);
			CMDBuild.core.Message.error(null, msg + invalidAttributes, false);
			return false;
		} else {
			return true;
		}
	}

	function addRefenceAttributesToDataIfNeeded(referenceAttributes, data) {
		// the referenceAttributes are like this:
		//	referenceAttributes: {
		//		referenceName: {
		//			firstAttr: 32,
		//			secondAttr: 'Foo'
		//		},
		//		secondReference: {...}
		//	}
		var ra = referenceAttributes;
		if (ra) {
			for (var referenceName in ra) {
				var attrs = ra[referenceName];
				for (var attribute in attrs) {
					data['_' + referenceName + '_' + attribute] = attrs[attribute];
				}
			}
		}
	}

	/**
	 * Parse idCard from input string witch derivates from templateResolver's idcardcqlselector
	 *
	 * @param (string) idCard
	 *
	 * @return (mixed) idCard - null or cardId parsed from input
	 */
	function normalizeIdCard(idCard) {
		if (typeof idCard == 'string') {
			idCard = parseInt(idCard.replace( /^\D+/g, ''));

			if (!isNaN(idCard))
				return idCard;
		}

		return null;
	}

	function updateLocalDepsIfReferenceToModifiedClass(me) {
		// we will synch the id of the modifyed
		// card with the reference that points to it
		// This is allowed only if the CQL used to get the id
		// of the card to modify is a simple pointer to a form field,
		// es {client:field_name}

		var referenceRX = /^\{client:(\w+)\}$/;
		var cql = me.cmfg('widgetCreateModifyCardConfigurationGet', CMDBuild.core.constants.Proxy.CQL_FILTER);
		var match = referenceRX.exec(cql);
		if (match != null) {
			var referenceName = match[1];
			if (referenceName) {
				var field = getFieldByName(me, referenceName);
				if (field &&
					field.CMAttribute) {

					field.store.load({
						callback: function () {
							field.setValue(me.savedCardId);
						}
					});
				}
			}
		}
	}

	function getFieldByName(me, name) {
		return me.clientForm.getFields().findBy(
			function findCriteria(f) {
				if (!f.CMAttribute) {
					return false;
				} else {
					return f.CMAttribute.name == name;
				}
			}
		);
	}

})();
