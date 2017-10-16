(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Advanced', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.toolbar.Paging}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'getView = workflowTreeFilterAdvancedViewGet',
			'onWorkflowTreeFilterAdvancedClearButtonClick',
			'onWorkflowTreeFilterAdvancedDisable',
			'onWorkflowTreeFilterAdvancedEnable',
			'onWorkflowTreeFilterAdvancedFilterSelect',
			'onWorkflowTreeFilterAdvancedManageToggleButtonClick',
			'workflowTreeFilterAdvancedLocalFilterAdd',
			'workflowTreeFilterAdvancedLocalFilterGet',
			'workflowTreeFilterAdvancedLocalFilterIsEmpty',
			'workflowTreeFilterAdvancedLocalFilterRemove',
			'workflowTreeFilterAdvancedManageToggleButtonLabelSet',
			'workflowTreeFilterAdvancedManageToggleStateReset'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager}
		 */
		controllerManager: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localFilterCache: {},

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.AdvancedView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Mixed} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.AdvancedView', { delegate: this });

			// Shorthands
			this.grid = this.cmfg('workflowTreeViewGet');

			// Build sub controllers
			this.controllerManager = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager', { parentDelegate: this });
		},

		/**
		 * @param {Boolean} silently
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedClearButtonClick: function (silently) {
			silently = Ext.isBoolean(silently) ? silently : false;

			// Error handling
				if (!Ext.isObject(this.grid) || Ext.Object.isEmpty(this.grid))
					return _error('onWorkflowTreeFilterAdvancedClearButtonClick(): grid not found', this, this.grid);
			// END: Error handling

			if (this.grid.getSelectionModel().hasSelection())
				this.grid.getSelectionModel().deselectAll();

			this.cmfg('workflowTreeFilterAdvancedManageToggleButtonLabelSet');

			this.view.clearButton.disable();

			if (!silently)
				this.cmfg('workflowTreeFilterClear', { type: 'advanced' });
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedDisable: function () {
			this.view.clearButton.disable();
			this.view.manageToggleButton.disable();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedEnable: function () {
			this.view.clearButton.enable();
			this.view.manageToggleButton.enable();
		},

		/**
		 * Apply selected filter to store or clear grid and buttons state
		 *
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterSelect: function (filter) {
			// Error handling
				if (!Ext.isObject(this.grid) || Ext.Object.isEmpty(this.grid))
					return _error('onWorkflowTreeFilterAdvancedFilterSelect(): grid not found', this, this.grid);
			// END: Error handling

			this.controllerManager.cmfg('workflowTreeFilterAdvancedManagerViewClose');

			this.view.clearButton.enable();

			if (
				Ext.isObject(filter) && !Ext.Object.isEmpty(filter)
				&& Ext.getClassName(filter) == 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter'
			) {
				filter.resetRuntimeParametersValue();

				this.cmfg('workflowTreeFilterAdvancedManageToggleButtonLabelSet', filter.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
				this.cmfg('workflowTreeFilterApply', {
					filter: filter,
					type: 'advanced'
				});
			} else {
				this.cmfg('onWorkflowTreeFilterAdvancedClearButtonClick');
			}
		},

		/**
		 * @param {Boolean} buttonState
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedManageToggleButtonClick: function (buttonState) {
			if (buttonState) {
				this.controllerManager.cmfg('workflowTreeFilterAdvancedManagerViewShow');
			} else {
				this.controllerManager.cmfg('workflowTreeFilterAdvancedManagerViewClose');
			}
		},

		/**
		 * @param {String} label
		 *
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManageToggleButtonLabelSet: function (label) {
			this.view.manageToggleButton.setText(Ext.isEmpty(label) ? CMDBuild.Translation.searchFilter : Ext.String.ellipsis(label, 35));
			this.view.manageToggleButton.setTooltip(Ext.isEmpty(label) ? '' : label);
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedManageToggleStateReset: function () {
			this.view.manageToggleButton.toggle(false);
		},

		// LocalFilterCache property functions
			/**
			 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterAdvancedLocalFilterAdd: function (filterModel) {
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var filterIdentifier = filterModel.get(CMDBuild.core.constants.Proxy.ID);

					if (Ext.isEmpty(filterIdentifier))
						filterIdentifier = new Date().valueOf(); // Compatibility mode with IE older than IE 9 (Date.now())

					this.localFilterCache[filterIdentifier] = filterModel;
				} else {
					_error('workflowTreeFilterAdvancedLocalFilterAdd(): unmanaged filterModel parameter', this, filterModel);
				}
			},

			/**
			 * @returns {Array} localFilterModels
			 */
			workflowTreeFilterAdvancedLocalFilterGet: function () {
				var localFilterModels = Ext.Object.getValues(this.localFilterCache),
					selectedEntryTypeName = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

				// Remove filter models not related with selected entrytype
				if (Ext.isArray(localFilterModels) && !Ext.isEmpty(localFilterModels))
					localFilterModels = Ext.Array.filter(localFilterModels, function (filterModel, i, allFilterModels) {
						return filterModel.get(CMDBuild.core.constants.Proxy.ENTRY_TYPE) == selectedEntryTypeName;
					}, this);

				return localFilterModels;
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowTreeFilterAdvancedLocalFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'localFilterCache';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterAdvancedLocalFilterRemove: function (filterModel) {
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var identifierToDelete = null;

					// Search for filter
					Ext.Object.each(this.localFilterCache, function (id, object, myself) {
						var filterModelObject = filterModel.getData();
						var localFilterObject = object.getData();

						if (Ext.Object.equals(filterModelObject, localFilterObject))
							identifierToDelete = id;
					}, this);

					if (!Ext.isEmpty(identifierToDelete))
						delete this.localFilterCache[identifierToDelete];
				} else {
					_error('workflowTreeFilterAdvancedLocalFilterRemove(): unmanaged filterModel parameter', this, filterModel);
				}
			}
	});

})();
