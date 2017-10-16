(function() {

	/**
	 * @link CMDBuild.view.management.classes.CMCardForm
	 *
	 * @legacy
	 */
	Ext.define("CMDBuild.view.management.workflow.panel.form.tabs.activity.FormPanel", {
		extend: "Ext.form.Panel",

		mixins: {
			cmFormFunctions: "CMDBUild.view.common.CMFormFunctions"
		},

		_lastCard: null, // to sync the editable panel when goes in edit mode

		_isInEditMode: false,

		constructor: function(conf) {
			Ext.apply(this, conf);

			this.CMEVENTS = {
				advanceCardButtonClick: "cm-advance",
				checkEditability: "cm-check-editability",
				saveCardButtonClick: "cm-save",
				abortButtonClick: "cm-abort",
				removeCardButtonClick: "cm-remove",
				modifyCardButtonClick: "cm-modify",
				openGraphButtonClick: "cm-graph",
				formFilled: "cmFormFilled",
				editModeDidAcitvate: "cmeditmode",
				displayModeDidActivate: "cmdisplaymode"
			};

			this.addEvents([
				this.CMEVENTS.saveCardButtonClick,
				this.CMEVENTS.abortButtonClick,
				this.CMEVENTS.removeCardButtonClick,
				this.CMEVENTS.modifyCardButtonClick,
				this.CMEVENTS.openGraphButtonClick,
				this.CMEVENTS.editModeDidAcitvate,
				this.CMEVENTS.displayModeDidActivate
			]);

			this.buildTBar();
			this.buildButtons();

			this.callParent(arguments);

			this.addEvents(this.CMEVENTS.advanceCardButtonClick);
			this.addEvents(this.CMEVENTS.checkEditability);
		},

		initComponent: function() {
			Ext.apply(this, {
				frame: false,
				border: false,
				hideMode: "offsets",
				bodyCls: "x-panel-body-default-framed cmdb-border-top",
				bodyStyle: {
					padding: "5px 5px 0 5px"
				},
				cls: "x-panel-body-default-framed",
				autoScroll: false,
				tbar: this.cmTBar,
				buttonAlign: 'center',
				buttons: this.cmButtons,
				layout: {
					type: 'hbox',
					align: 'stretch'
				}
			});

			this.callParent(arguments);
		},

		buildTBar: function() {
			this.graphButton = Ext.create('CMDBuild.core.buttons.iconized.RelationGraph', {
				scope: this,

				handler: function(button, e) {
					this.fireEvent(this.CMEVENTS.openGraphButtonClick);
				}
			});

			/*
			 * use buttons as label because the display fields
			 * have some strange behaviours, the time is short,
			 * this solution works, is enough
			 */
			var buttonAsLabelConf = {
				pressedCls: "",
				overCls:"",
				disabledCls: "",
				disable: function(){},
				style: {
					cursor: "auto",
					color: "#000000"
				}
			};

			this.cmTBar = [
				this.modifyCardButton = Ext.create('CMDBuild.core.buttons.iconized.Modify', {
					text: CMDBuild.Translation.modifyActivity,
					scope: this,

					handler: function (button, e) {
						this.delegate.superController.cmfg('onWorkflowModifyButtonClick');
					}
				}),
				this.deleteCardButton = Ext.create('CMDBuild.core.buttons.iconized.Remove', {
					text: CMDBuild.Translation.abortProcess,
					scope: this,

					handler: function (button, e) {
						this.delegate.superController.cmfg('onWorkflowFormRemoveButtonClick');
					}
				}),
				CMDBuild.configuration.graph.get(CMDBuild.core.constants.Proxy.ENABLED) ? this.graphButton : null,
				'->','-',
				this.activityPerformerName = new Ext.button.Button(buttonAsLabelConf),
				'-',
				this.activityDescription = new Ext.button.Button(buttonAsLabelConf)
			];
		},

		buildButtons: function() {
			this.cmButtons = [
				this.saveButton = Ext.create('CMDBuild.core.buttons.text.Save', {
					scope: this,

					handler: function (button, e) {
						this.delegate.superController.cmfg('onWorkflowFormSaveButtonClick');
					}
				}),
				this.advanceButton = Ext.create('CMDBuild.core.buttons.text.Advance', {
					scope: this,

					handler: function (button, e) {
						this.delegate.superController.cmfg('onWorkflowFormAdvanceButtonClick');
					}
				}),
				this.cancelButton = Ext.create('CMDBuild.core.buttons.text.Abort', {
					text: this.readOnlyForm ? CMDBuild.Translation.close : CMDBuild.Translation.cancel,
					scope: this,

					handler: function (button, e) {
						this.delegate.superController.cmfg('onWorkflowAbortButtonClick');
					}
				})
			];
		},

		/**
		 * The controller must ask to the
		 * server if the editing process
		 * is in its last version.
		 *
		 * So here must defer the real behavior
		 * of this method after the asynchronous
		 * check.
		 *
		 * To do that, pass a function to
		 * the controller
		 */
		editMode: function() {
			var me = this;
			function activityPanelEditMode() {
				if (me._isInEditMode) {
					return;
				}

				me.ensureEditPanel();

				if (me.tabPanel) {
					me.tabPanel.editMode();
				}

				me.disableCMTbar();
				me.enableCMButtons();

				//http://www.sencha.com/forum/showthread.php?261407-4.2.0-HTML-editor-SetValue-does-not-work-when-component-is-not-rendered
				//This function for fixing the above bug
				//To delete when upgrade at extjs 4.2.1
				me.tabPanel.showAll();
				//-------------------------------------------------

				me.fireEvent(me.CMEVENTS.editModeDidAcitvate);
				me._isInEditMode = true;
			}

			me.fireEvent(me.CMEVENTS.checkEditability, activityPanelEditMode);
		},

		displayMode: function(enableCmBar) {
			this.suspendLayouts();
			if (this.tabPanel) {
				this.tabPanel.displayMode();
			}

			if (enableCmBar) {
				this.enableCMTbar();
			} else {
				this.disableCMTbar();
			}

			this.disableCMButtons();

			this.resumeLayouts(true);

			this.fireEvent(this.CMEVENTS.displayModeDidActivate);
			this._isInEditMode = false;
		},

		hasDomainAttributes: function() {
			var fields = this.getForm().getFields().items;

			for (var i=0, l=fields.length; i<l; ++i) {
				if (fields[i].cmDomainAttribute) {
					return true;
				}
			};

			return false;
		},

		disableStopButton : function() {
			this.deleteCardButton.disable();
		},

		displayModeForNotEditableCard: function() {
			this.displayMode(enableCMBar = false);
			if (this.graphButton) {
				this.graphButton.enable();
			}
		},

		reset: function() {
			this.suspendLayouts();
			this._isInEditMode = false;
			this.mixins.cmFormFunctions.reset.apply(this);
			this.resumeLayouts(true);
		},

		enableStopButton : function() {
			if (! this.deleteCardButton.disabledForGroup) {
				this.deleteCardButton.enable();
			}
		},

		// fill the form with the data in the card
		loadCard: function(card, bothPanels) {
			this._lastCard = card;
			this.reset();

			if (!card) { return; }

			if (typeof card == "object") {
				var data = card.raw || card.data;

				if (bothPanels) {
					_fillFields(this, data);
				} else if (this._isInEditMode) {
					_fillEditableFields(this, data);
				} else {
					_fillDisplayFields(this, data);
				}

				this.initValues(); // Clear form fields dirty state
			} else {
				throw "Card must be an object";
			}
		},

		// popolate the form with the right subpanels and fields
		fillForm: fillForm,

		isInEditing: function() {
			return this._isInEditMode;
		},

		ensureEditPanel: function() {
			if (this.tabPanel && !this._isInEditMode) {
				this.tabPanel.ensureEditPanel();

				if (this._lastCard) {
					this.loadCard(this._lastCard, bothPanels=true);
					this.callFieldTemplateResolverIfNeeded();
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		callFieldTemplateResolverIfNeeded: function () {
			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'templateResolverBarrier',
				scope: this,
				callback: function () {
					if (Ext.isObject(this._lastCard) && !Ext.Object.isEmpty(this._lastCard))
						_fillFields(this, this._lastCard.raw || this._lastCard.data);
				}
			});

			this.getForm().getFields().each(function (field, i, len) {
				if (Ext.isObject(field) && !Ext.Object.isEmpty(field) && Ext.isFunction(field.resolveTemplate))
					field.resolveTemplate({ iden: field.name, callback: requestBarrier.getCallback('templateResolverBarrier') });
			}, this);

			requestBarrier.finalize('templateResolverBarrier', true);
		},

		updateInfo : function(performerName, activityDescription) {
			this.activityPerformerName.setText(performerName || "");
			this.activityDescription.setText(activityDescription || "");
		},

		/**
		 * @deprecated
		 */
		canReconfigureTheForm: function() {
			return this.cmOwner.isTheActivePanel();
		},

		toString: function() {
			return "CMCardForm";
		}
	});

	function _fillDisplayFields(me, data, referenceAttributes) {
		_fillFields(me, data, referenceAttributes, function(f) {
			return !f._belongToEditableSubpanel;
		});
	}

	function _fillEditableFields(me, data, referenceAttributes) {
		_fillFields(me, data, referenceAttributes, function(f) {
			return f._belongToEditableSubpanel;
		});
	}

	// FIXME: probably never reached 'couse the reference's attributes are added in the controller
	function addReferenceAttrsToData(data, referenceAttributes) {
		for (var referenceName in referenceAttributes || {}) {
			var attributes = referenceAttributes[referenceName];

			for (var attributeName in attributes) {
				var fullName = "_" + referenceName + "_" + attributeName,
					value = attributes[attributeName];

				data[fullName] = value;
			}
		}
	}

	/**
	 * @param {CMDBuild.view.management.classes.CMCardForm} me
	 * @param {Object} data
	 * @param {Object} referenceAttributes
	 * @param {Function} fieldSelector
	 */
	function _fillFields(me, data, referenceAttributes, fieldSelector) {
		var fields = me.getForm().getFields();

		if (Ext.getClassName(fields) == 'Ext.util.MixedCollection')
			fields = fields.items;

		// Suspend all events on fields to prevent values modifications by internal fields events listeners
		// This fixes ReferenceFields empty values going on editMode
		for (var idx in fields)
			if (fields[idx].isObservable && Ext.isFunction(fields[idx].suspendEvents))
				fields[idx].suspendEvents(false);

		addReferenceAttrsToData(data, referenceAttributes);

		if (fields) {
			for (var i=0, l=fields.length; i<l; ++i) {
				var f = fields[i];

				if (!(typeof fieldSelector == 'function' && !fieldSelector(f))) {
					try {
						f.setValue(data[f.name]);
						if (typeof f.isFiltered == 'function' && f.isFiltered()) {
							f.setServerVarsForTemplate(data);
						}
					} catch (e) {
						_msg('[Field name: ' + f.name + '] ' + e.message);
					}
				}
			}
		}

		// Resume events on fields
		for (var idx in fields)
			if (fields[idx].isObservable && Ext.isFunction(fields[idx].resumeEvents))
				fields[idx].resumeEvents();

		me.fireEvent(me.CMEVENTS.formFilled);
	}

	function loadCard(card) {
		if (this.loadRemoteData || this.hasDomainAttributes()) {
			this.loadCard(card.get("Id"), card.get("IdClass"));
		} else {
			this.loadCard(card);
		}

		this.loadRemoteData = false;
	}

	function fillForm(attributes, editMode) {

		this._lastCard = null;

		var panels = [],
			groupedAttr = CMDBuild.Utils.groupAttributes(attributes, false);

		this.suspendLayouts();

		this.removeAll(autoDestroy = true);

		// The fields of sub-panels are not
		// removed from the Ext.form.Basic
		// Do it by hand
		var basicForm = this.getForm();
		var basicFormFields = basicForm.getFields(); // a Ext.util.MixedCollection
		basicFormFields.clear();

		for (var group in groupedAttr) {
			var attributes = groupedAttr[group];
			var p = CMDBuild.Management.EditablePanel.build({
				attributes: attributes,
				frame: false,
				border: false,
				title: group,
				bodyCls: "x-panel-body-default-framed",
				bodyStyle: {
					padding: "5px"
				}
			});

			if (p) {
				panels.push(p);
			}
		}

		if (this.tabPanel) {
			delete this.tabPanel;
		}

		if (panels.length == 0) {
			// hack to have a framed panel
			// if there are no attributes
			panels = [new CMDBuild.Management.EditablePanel({
				attributes: [],
				frame: false,
				border: false,
				title: "",
				bodyCls: "x-panel-body-default-framed",
				bodyStyle: {
					padding: "5px"
				}
			})];
		}

		this.tabPanel = new CMDBuild.view.management.common.CMTabPanel({
			items: panels,
			frame: false,
			flex: 1
		});

		this.add(this.tabPanel);

		// Resume the layouts when end
		// to add the fields
		this.resumeLayouts(true);
		this.doLayout();

		if (this.danglingCard) {
			loadCard.call(this, this.danglingCard);
			this.danglingCard = null;
		}

		if (editMode || this.forceEditMode) {
			this.editMode();
			this.forceEditMode = false;
		}

	};

})();
