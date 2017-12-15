(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.Tab', {
		extend: 'CMDBuild.controller.common.panel.module.form.Tab',

		uses: [
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.LoadMask'
		],

		mixins: ['CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ViewMode'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowFormTabActivityAdvanceButtonClick',
			'onWorkflowFormTabActivitySaveButtonClick',
			'onWorkflowFormTabActivityShow = onPanelModuleFormTabShow',
			'panelGridAndFormMixinsViewModeEquals = panelGridAndFormViewModeEquals',
			'panelGridAndFormMixinsViewModeGet = panelGridAndFormViewModeGet, workflowViewModeGet',
			'panelGridAndFormMixinsViewModeSet = panelGridAndFormViewModeSet, workflowViewModeSet',
			'panelModuleFormFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'panelModuleFormTabDisable',
			'panelModuleFormTabReset = workflowFormTabActivityReset',
			'workflowFormTabActivityUiUpdate = panelModuleFormTabUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.widget.panel.ButtonGroup}
		 */
		controllerPanelWidget: undefined,

		/**
		 * @property {Number}
		 *
		 * FIXME: waiting for refactor (UiUpdate)
		 */
		selectedInstanceId: undefined,

		/**
		 * Definitions of all sub-classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			form: 'CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel',
			panelWidget: 'CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.widget.panel.ButtonGroup',
			view: 'CMDBuild.view.management.workflow.panel.form.tabs.activityNew.TabView',
		},

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.activityNew.TabView}
		 */
		view: undefined,

		/**
		 * @returns {String or null}
		 *
		 * @private
		 */
		metadataManageSelectedAttributesGroup: function () {
			if (!this.cmfg('workflowSelectedActivityIsEmpty', CMDBuild.core.constants.Proxy.METADATA)) {
				var attributeGroupId = null,
					attributes = this.cmfg('workflowSelectedWorkflowAttributesGet');

				Ext.Array.forEach(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.METADATA), function (metadataObject, i, allMetadataObjects) {
					if (Ext.isObject(metadataObject) && !Ext.Object.isEmpty(metadataObject))
						switch (metadataObject[CMDBuild.core.constants.Proxy.NAME]) {
							case CMDBuild.core.constants.Metadata.getSelectedAttributesGroup(): {
								var markerAttribute = Ext.Array.findBy(attributes, function (item, i) {
										return item.getData()[CMDBuild.core.constants.Proxy.NAME] == metadataObject[CMDBuild.core.constants.Proxy.VALUE];
									}, this),
								markerAttributeGroup = markerAttribute != null ? markerAttribute.get(CMDBuild.core.constants.Proxy.GROUP) : "";

								if (Ext.isString(markerAttributeGroup) && !Ext.isEmpty(markerAttributeGroup))
									attributeGroupId = Ext.String.trim(markerAttributeGroup).replace(/\s+/g, ''); // FIXME: waiting for refactor (attribute's group identifiers)
							} break;
						}
				}, this);

				return attributeGroupId;
			}

			return null;
		},

		/**
		 * Execute advance action only before widget complete save
		 * BUSINESS-RULE: validation required only on advance action, not on save only
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabActivityAdvanceButtonClick: function () {
	
			if (this.controllerForm.cmfg('panelModulePanelFunctionsIsValid')) {
				CMDBuild.core.LoadMask.show(); // Manual loadMask manage (removed from create/update calls)
				this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupSave', {
					scope: this,
					callback: function () {
						this.cmfg('onWorkflowUpdateButtonClick', {
							advance: true,
							activityData: this.controllerForm.cmfg('panelModuleFormPanelFieldsDataGet'),
							widgetData: this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupValuesGet')
						});
					}
				});
			}
		},

		/**
		 * Execute save action only before widget complete save
		 * BUSINESS-RULE: validation required only on advance action, not on save only
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabActivitySaveButtonClick: function () {
			CMDBuild.core.LoadMask.show(); // Manual loadMask manage (removed from create/update calls)

			this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupSave', {
				scope: this,
				callback: function () {
					this.cmfg('onWorkflowUpdateButtonClick', {
						activityData: this.controllerForm.cmfg('panelModuleFormPanelFieldsDataGet'),
						widgetData: this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupValuesGet')
					});
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 * @param {Object or String or Number} parameters.subTabToSelect
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabActivityShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.subTabToSelect = this.metadataManageSelectedAttributesGroup();

			// History record save
			if (
				!this.cmfg('workflowSelectedWorkflowIsEmpty')
				&& !this.cmfg('workflowSelectedInstanceIsEmpty')
				&& this.cmfg('panelGridAndFormViewModeEquals', ['read', 'readOnly'])
			) {
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: CMDBuild.core.constants.ModuleIdentifiers.getWorkflow(),
					entryType: {
						description: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('workflowSelectedWorkflowGet')
					},
					item: {
						description: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('workflowSelectedInstanceGet')
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
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 * @param {String} parameters.viewMode
		 *
		 * @returns {Void}
		 */
		workflowFormTabActivityUiUpdate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;
			parameters.viewMode = Ext.isString(parameters.viewMode) ? parameters.viewMode : 'read';

			// Setup viewMode related on correct advanced activity id - FIXME: waiting for refactor (UiUpdate)
			if (!Ext.isEmpty(this.selectedInstanceId) && this.selectedInstanceId == this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID))
				parameters.viewMode = 'edit';

			if (
				this.cmfg('workflowSelectedInstanceIsEmpty')
				|| this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getAbortedCapitalized()
				|| this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized()
			) {
				parameters.viewMode = 'readOnly';
			}

			// UI reset
			this.cmfg('workflowFormTabActivityReset');
			this.cmfg('workflowViewModeSet', parameters.viewMode);

			// Local variables reset
			if (!this.cmfg('workflowSelectedActivityIsEmpty')) // Reset variable only if activity is not empty because only now we are in edit
				this.selectedInstanceId = undefined; // FIXME: waiting for refactor (UiUpdate)

			/**
			 * Legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			 *
			 * @legacy
			 */
			switch (this.cmfg('workflowViewModeGet')) {
				case 'add': {
					var me = this;

					_CMWFState.setProcessInstance(
						Ext.create('CMDBuild.model.CMProcessInstance', { classId: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.CLASS_ID) }),
						function () {
							_CMWFState.setActivityInstance(new CMDBuild.model.CMActivityInstance(me.cmfg('workflowSelectedActivityGet', 'rawData')));
						}
					);
				} break;

				case 'edit': { // FIXME: waiting for refactor (UiUpdate)
					this.cmfg('workflowActivityLock', {
						scope: this,
						callback: function () {
							// Forward to sub-controllers
							this.controllerForm.cmfg('panelModuleFormPanelUiUpdate');
							this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupUiUpdate');

							this.view.setDisabled(
								this.cmfg('workflowSelectedWorkflowIsEmpty')
								|| this.cmfg('workflowSelectedInstanceIsEmpty')
							);

							// Not real correct callback place, but I can't go through tab view event from here
							if (Ext.isFunction(parameters.callback))
								Ext.callback(parameters.callback, parameters.scope);

							return;
						}
					});
				} break;
			}

			// Forward to sub-controllers
			this.controllerForm.cmfg('panelModuleFormPanelUiUpdate');
			this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupUiUpdate');

			this.view.setDisabled(
				this.cmfg('workflowSelectedWorkflowIsEmpty')
				|| this.cmfg('workflowSelectedInstanceIsEmpty')
			);

			// Not real correct callback place, but I can't go through tab view event from here
			if (Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, parameters.scope);
		}
	});

})();
