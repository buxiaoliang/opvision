(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Advanced}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeFilterAdvancedManagerAddButtonClick',
			'onWorkflowTreeFilterAdvancedManagerCloneButtonClick',
			'onWorkflowTreeFilterAdvancedManagerModifyButtonClick',
			'onWorkflowTreeFilterAdvancedManagerRemoveButtonClick',
			'onWorkflowTreeFilterAdvancedManagerSaveButtonClick',
			'onWorkflowTreeFilterAdvancedManagerViewShow',
			'workflowTreeFilterAdvancedManagerSave',
			'workflowTreeFilterAdvancedManagerSelectedFilterGet',
			'workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty',
			'workflowTreeFilterAdvancedManagerSelectedFilterSet',
			'workflowTreeFilterAdvancedManagerStoreIsEmpty',
			'workflowTreeFilterAdvancedManagerViewClose',
			'workflowTreeFilterAdvancedManagerViewShow'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor}
		 */
		controllerFilterEditor: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.SaveDialog}
		 */
		controllerSaveDialog: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.manager.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter}
		 *
		 * @private
		 */
		selectedFilter: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.manager.ManagerWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Advanced} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.manager.ManagerWindow', { delegate: this });

			// Build sub controllers
			this.controllerFilterEditor = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor', { parentDelegate: this });
			this.controllerSaveDialog = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.SaveDialog', { parentDelegate: this});

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerAddButtonClick: function () {
			var emptyFilterObject = {};
			emptyFilterObject[CMDBuild.core.constants.Proxy.ENTRY_TYPE] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);
			emptyFilterObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.newSearchFilter;

			this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: emptyFilterObject }); // Manual save call (with empty data)

			this.controllerFilterEditor.getView().show();
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerCloneButtonClick: function (filter) {
			if (Ext.isObject(filter) && !Ext.Object.isEmpty(filter)) {
				var clonedFilterObject = filter.getData();
				clonedFilterObject[CMDBuild.core.constants.Proxy.ID] = null;
				clonedFilterObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.copyOf + ' ' + filter.get(CMDBuild.core.constants.Proxy.NAME);

				this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: clonedFilterObject }); // Manual save call (with cloned data)

				this.controllerFilterEditor.getView().show();
			} else {
				_error('onWorkflowTreeFilterAdvancedManagerCloneButtonClick(): wrong filter parameter', this, filter);
			}
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerModifyButtonClick: function (filter) {
			if (Ext.isObject(filter) && !Ext.Object.isEmpty(filter)) {
				this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: filter }); // Manual save call (with filter data)

				this.controllerFilterEditor.getView().show();
			} else {
				_error('onWorkflowTreeFilterAdvancedManagerModifyButtonClick(): wrong filter parameter', this, filter);
			}
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerRemoveButtonClick: function (filter) {
			Ext.MessageBox.confirm(
				CMDBuild.Translation.attention,
				CMDBuild.Translation.common.confirmpopup.areyousure,
				function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem(filter);
				},
				this
			);
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerSaveButtonClick: function (filter) {
			if (Ext.isObject(filter) && !Ext.Object.isEmpty(filter)) {
				// Remove name and description to force save dialog show
				var filterObject = filter.getData();
				delete filterObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
				delete filterObject[CMDBuild.core.constants.Proxy.NAME];

				this.cmfg('workflowTreeFilterAdvancedLocalFilterRemove', filter);
				this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: filterObject }); // Manual save call (with filter data)
				this.cmfg('workflowTreeFilterAdvancedManagerSave');
			} else {
				_error('onWorkflowTreeFilterAdvancedManagerSaveButtonClick(): wrong filter parameter', this, filter);
			}
		},

		/**
		 * On show event define window details:
		 * 	- reset selections
		 * 	- set correct position
		 * 	- add event to manage view outside click manage
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManagerViewShow: function () {
			if (this.grid.getSelectionModel().hasSelection())
				this.grid.getSelectionModel().deselectAll();

			var buttonBox = this.cmfg('workflowTreeFilterAdvancedViewGet').getBox();

			if (!Ext.isEmpty(buttonBox))
				this.view.setPosition(buttonBox.x, buttonBox.y + buttonBox.height);

			Ext.getBody().on('click', this.onViewOutsideClick, this); // Outside click manage
		},

		/**
		 * Hide on outside click
		 *
		 * @param {Object} e
		 * @param {Object} t
		 * @param {Object} eOpts
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		onViewOutsideClick: function (e, t, eOpts) {
			var el = this.view.getEl();

			if (!(el.dom === t || el.contains(t))) {
				Ext.getBody().un('click', this.onViewOutsideClick, this);

				this.cmfg('workflowTreeFilterAdvancedManageToggleStateReset');
				this.view.close();
			}
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function (filter) {
			if (Ext.isObject(filter) && !Ext.Object.isEmpty(filter)) {
				this.cmfg('workflowTreeFilterAdvancedManagerViewClose');

				if (Ext.isEmpty(filter.get(CMDBuild.core.constants.Proxy.ID))) { // Remove from local storage
					if (filter.get(CMDBuild.core.constants.Proxy.ID) == this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.ID))
						this.cmfg('onWorkflowTreeFilterAdvancedClearButtonClick');

					this.cmfg('workflowTreeFilterAdvancedLocalFilterRemove', filter);
					this.cmfg('workflowTreeFilterAdvancedManageToggleButtonLabelSet');
					this.cmfg('workflowTreeFilterAdvancedManagerViewShow');
				} else { // Remove from server
					var params = {};
					params[CMDBuild.core.constants.Proxy.ID] = filter.get(CMDBuild.core.constants.Proxy.ID);

					CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.remove({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							if (filter.get(CMDBuild.core.constants.Proxy.ID) == this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.ID))
								this.cmfg('onWorkflowTreeFilterAdvancedClearButtonClick');

							this.cmfg('workflowTreeFilterAdvancedManageToggleButtonLabelSet');
							this.cmfg('workflowTreeFilterAdvancedManagerViewShow');
						}
					});
				}
			} else {
				_error('removeItem(): unmanaged filter parameter', this, filter);
			}
		},

		/**
		 * @param {Boolean} enableApply
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		saveActionManage: function (enableApply) {
			enableApply = Ext.isBoolean(enableApply) ? enableApply : false;

			// Error handling
				if (this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty'))
					return _error('saveActionManage(): empty selected filter', this, this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));
			// END: Error handling

			var filter = this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet');

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = filter.get(CMDBuild.core.constants.Proxy.ENTRY_TYPE); // FIXME: i read entryType and write className (rename)
			params[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.encode(filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION));
			params[CMDBuild.core.constants.Proxy.DESCRIPTION] = filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
			params[CMDBuild.core.constants.Proxy.NAME] = filter.get(CMDBuild.core.constants.Proxy.NAME);

			if (Ext.isEmpty(filter.get(CMDBuild.core.constants.Proxy.ID))) {
				CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.create({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.FILTER];

						if (Ext.isObject(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.controllerSaveDialog.cmfg('onWorkflowTreeFilterAdvancedSaveDialogAbortButtonClick'); // Close save dialog view
							this.controllerFilterEditor.cmfg('onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
							this.cmfg('workflowTreeFilterAdvancedManagerViewClose'); // Close manager view

							if (enableApply) { // Apply filter to store
								this.cmfg('onWorkflowTreeFilterAdvancedFilterSelect', Ext.create('CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter', decodedResponse));
								this.workflowTreeFilterAdvancedManagerSelectedFilterReset();
							} else { // Otherwise reopen manager window
								this.cmfg('workflowTreeFilterAdvancedManagerViewShow');
							}
						} else {
							_error('saveActionManage(): unmanaged create response', this, decodedResponse);
						}
					}
				});
			} else {
				params[CMDBuild.core.constants.Proxy.ID] = filter.get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.workflow.panel.tree.filter.advanced.Manager.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						// FIXME: hack as workaround, should be fixed on server side returning all saved filter object
						decodedResponse = params;
						decodedResponse[CMDBuild.core.constants.Proxy.ENTRY_TYPE] = decodedResponse[CMDBuild.core.constants.Proxy.CLASS_NAME];
						decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.decode(decodedResponse[CMDBuild.core.constants.Proxy.CONFIGURATION]);

						if (Ext.isObject(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.controllerSaveDialog.cmfg('onWorkflowTreeFilterAdvancedSaveDialogAbortButtonClick'); // Close save dialog view
							this.controllerFilterEditor.cmfg('onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
							this.cmfg('workflowTreeFilterAdvancedManagerViewClose'); // Close manager view

							if (enableApply) {// Apply filter to store
								this.cmfg('onWorkflowTreeFilterAdvancedFilterSelect', Ext.create('CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter', decodedResponse));
								this.workflowTreeFilterAdvancedManagerSelectedFilterReset();
							} else { // Otherwise reopen manager window
								this.cmfg('workflowTreeFilterAdvancedManagerViewShow');
							}
						} else {
							_error('saveActionManage(): unmanaged update response', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * SelectedFilter property methods
		 *
		 * Not real selected filter, is just filter witch FilterEditor will manage.
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowTreeFilterAdvancedManagerSelectedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeFilterAdvancedManagerSelectedFilterReset: function () {
				this.propertyManageReset('selectedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterAdvancedManagerSelectedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.enableApply
		 * @param {Boolean} parameters.enableSaveDialog
		 *
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManagerSave: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableApply = Ext.isBoolean(parameters.enableApply) ? parameters.enableApply : false;
			parameters.enableSaveDialog = Ext.isBoolean(parameters.enableSaveDialog) ? parameters.enableSaveDialog : true;

			if (!this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty')) {
				if (parameters.enableSaveDialog)
					return this.controllerSaveDialog.cmfg('workflowTreeFilterAdvancedSaveDialogShow', parameters.enableApply);

				return this.saveActionManage(parameters.enableApply);
			} else {
				_error('workflowTreeFilterAdvancedManagerSave(): cannot save empty filter', this, this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));
			}
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManagerStoreIsEmpty: function () {
			return this.grid.getStore().count() == 0;
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManagerViewClose: function () {
			this.view.close();
		},

		/**
		 * Shows and configures manager or filter window before evaluation after filter grid load (acts like beforeshow event)
		 *
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManagerViewShow: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({
				params: params,
				scope: this,
				callback: function (records, operation, success) {
					if (success) {
						// Add local cached filters to store
						if (!this.cmfg('workflowTreeFilterAdvancedLocalFilterIsEmpty')) {
							this.grid.getStore().add(this.cmfg('workflowTreeFilterAdvancedLocalFilterGet'));
							this.grid.getStore().sort();
						}

						if (this.grid.getStore().count() == 0) {
							this.cmfg('onWorkflowTreeFilterAdvancedManagerAddButtonClick');
						} else {
							this.view.show();
						}
					}
				}
			});
		}
	});

})();
