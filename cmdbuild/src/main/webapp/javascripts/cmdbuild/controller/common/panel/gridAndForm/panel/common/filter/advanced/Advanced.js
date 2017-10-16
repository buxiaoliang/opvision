(function () {

	/**
	 * @link CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Advanced
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormFilterAdvancedAppliedFilterGet',
			'panelGridAndFormFilterAdvancedAppliedFilterIsEmpty',
			'panelGridAndFormFilterAdvancedAppliedFilterReset',
			'panelGridAndFormFilterAdvancedAppliedFilterSet',
			'panelGridAndFormFilterAdvancedEntryTypeGet',
			'panelGridAndFormFilterAdvancedEntryTypeIsEmpty',
			'panelGridAndFormFilterAdvancedEntryTypeSet = entryTypeSet',
			'panelGridAndFormFilterAdvancedLocalFilterAdd',
			'panelGridAndFormFilterAdvancedLocalFilterGet',
			'panelGridAndFormFilterAdvancedLocalFilterIsEmpty',
			'panelGridAndFormFilterAdvancedLocalFilterRemove',
			'panelGridAndFormFilterAdvancedManageToggleButtonLabelSet',
			'panelGridAndFormFilterAdvancedManageToggleStateReset',
			'panelGridAndFormFilterAdvancedMasterGridGet',
			'getView = panelGridAndFormFilterAdvancedViewGet',
			'onPanelGridAndFormFilterAdvancedClearButtonClick',
			'onPanelGridAndFormFilterAdvancedDisable',
			'onPanelGridAndFormFilterAdvancedEnable',
			'onPanelGridAndFormFilterAdvancedFilterSelect',
			'onPanelGridAndFormFilterAdvancedManageToggleButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		controllerManager: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		localFilterCache: {},

		/**
		 * @cfg {Ext.grid.Panel}
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent)
		 */
		masterGrid: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.gridAndForm.filter.advanced.SelectedEntryType}
		 *
		 * @private
		 */
		selectedEntryType: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.AdvancedView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.AdvancedView', { delegate: this });

			// Build sub controllers
			this.controllerManager = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager', { parentDelegate: this });
		},

		/**
		 * AppliedFilter property functions
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent, grid controller)
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelGridAndFormFilterAdvancedAppliedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormFilterAdvancedAppliedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormFilterAdvancedAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormFilterAdvancedAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * EntryType property functions
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent, grid controller)
		 */
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelGridAndFormFilterAdvancedEntryTypeGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelGridAndFormFilterAdvancedEntryTypeIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';
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
			panelGridAndFormFilterAdvancedEntryTypeSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.filter.advanced.SelectedEntryType';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntryType';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {String} label
		 *
		 * @returns {Void}
		 */
		panelGridAndFormFilterAdvancedManageToggleButtonLabelSet: function (label) {
			this.view.manageToggleButton.setText(Ext.isEmpty(label) ? CMDBuild.Translation.searchFilter : Ext.String.ellipsis(label, 35));
			this.view.manageToggleButton.setTooltip(Ext.isEmpty(label) ? '' : label);
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormFilterAdvancedManageToggleStateReset: function () {
			this.view.manageToggleButton.toggle(false);
		},

		/**
		 * @returns {Ext.grid.Panel}
		 *
		 * @legacy
		 *
		 * FIXME: waiting for refactor (move to parent)
		 */
		panelGridAndFormFilterAdvancedMasterGridGet: function () {
			return this.masterGrid;
		},

		// LocalFilterCache property functions
			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			panelGridAndFormFilterAdvancedLocalFilterAdd: function (filterModel) {
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var filterIdentifier = filterModel.get(CMDBuild.core.constants.Proxy.ID);

					if (Ext.isEmpty(filterIdentifier))
						filterIdentifier = new Date().valueOf(); // Compatibility mode with IE older than IE 9 (Date.now())

					this.localFilterCache[filterIdentifier] = filterModel;
				} else {
					_error('panelGridAndFormFilterAdvancedLocalFilterAdd(): unmanaged filterModel parameter', this, filterModel);
				}
			},

			/**
			 * @returns {Array}
			 */
			panelGridAndFormFilterAdvancedLocalFilterGet: function () {
				var localFilterModels = Ext.Object.getValues(this.localFilterCache),
					selectedEntryTypeName = this.cmfg('panelGridAndFormFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

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
			panelGridAndFormFilterAdvancedLocalFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'localFilterCache';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter} filterModel
			 *
			 * @returns {Void}
			 */
			panelGridAndFormFilterAdvancedLocalFilterRemove: function (filterModel) {
				if (Ext.isObject(filterModel) && !Ext.Object.isEmpty(filterModel)) {
					var identifierToDelete = null;

					// Search for filter
					Ext.Object.each(this.localFilterCache, function (id, object, myself) {
						var filterModelObject = filterModel.getData(),
							localFilterObject = object.getData();

						if (Ext.Object.equals(filterModelObject, localFilterObject))
							identifierToDelete = id;
					}, this);

					if (!Ext.isEmpty(identifierToDelete))
						delete this.localFilterCache[identifierToDelete];
				} else {
					_error('panelGridAndFormFilterAdvancedLocalFilterRemove(): unmanaged filterModel parameter', this, filterModel);
				}
			},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedClearButtonClick: function () {
			var masterGrid = this.cmfg('panelGridAndFormFilterAdvancedMasterGridGet');

			if (!Ext.isEmpty(masterGrid)) {
				if (masterGrid.getSelectionModel().hasSelection())
					masterGrid.getSelectionModel().deselectAll();

				if (!this.cmfg('panelGridAndFormFilterAdvancedAppliedFilterIsEmpty'))
					this.cmfg('panelGridAndFormFilterAdvancedAppliedFilterReset');

				this.cmfg('panelGridAndFormFilterAdvancedManageToggleButtonLabelSet');

				this.view.clearButton.disable();

				/**
				 * @legacy
				 *
				 * FIXME: waiting for refactor (use cmfg)
				 * FIXME: hack to temporary fix DataView bug
				 */
				if (
					Ext.isObject(CMDBuild.global.dataViewHack) && !Ext.Object.isEmpty(CMDBuild.global.dataViewHack)
					&& Ext.isString(CMDBuild.global.dataViewHack.filter) && !Ext.isEmpty(CMDBuild.global.dataViewHack.filter)
					&& CMDBuild.global.dataViewHack.entryType.get(CMDBuild.core.constants.Proxy.ID) == this.cmfg('panelGridAndFormFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.ID)
				) {
					masterGrid.applyFilterToStore(Ext.decode(CMDBuild.global.dataViewHack.filter));
					masterGrid.reload();
				} else {
					if (!Ext.isEmpty(CMDBuild.global.dataViewHack))
						delete CMDBuild.global.dataViewHack;

					masterGrid.applyFilterToStore({});
					masterGrid.reload();
				}
			} else {
				_error('onPanelGridAndFormFilterAdvancedClearButtonClick(): empty master grid', this, masterGrid);
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedDisable: function () {
			this.view.clearButton.disable();
			this.view.manageToggleButton.disable();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedEnable: function () {
			this.view.clearButton.enable();
			this.view.manageToggleButton.enable();
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterSelect: function (filter) {
			var masterGrid = this.cmfg('panelGridAndFormFilterAdvancedMasterGridGet');

			if (!Ext.isEmpty(masterGrid)) {
				this.controllerManager.cmfg('panelGridAndFormFilterAdvancedManagerViewClose');

				filter.resetRuntimeParametersValue();

				this.cmfg('panelGridAndFormFilterAdvancedAppliedFilterSet', { value: filter });
				this.cmfg(
					'panelGridAndFormFilterAdvancedManageToggleButtonLabelSet',
					this.cmfg('panelGridAndFormFilterAdvancedAppliedFilterGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
				);

				this.view.clearButton.enable();

				/**
				 * @legacy
				 *
				 * FIXME: waiting for refactor (use cmfg)
				 */
				masterGrid.delegate.onFilterMenuButtonApplyActionClick(Ext.create('CMDBuild.model.CMFilterModel', filter.getData()));
			} else {
				_error('onPanelGridAndFormFilterAdvancedFilterSelect(): empty master grid', this, masterGrid);
			}
		},

		/**
		 * @param {Boolean} buttonState
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedManageToggleButtonClick: function (buttonState) {
			if (buttonState) {
				this.controllerManager.cmfg('panelGridAndFormFilterAdvancedManagerViewShow');
			} else {
				this.controllerManager.cmfg('panelGridAndFormFilterAdvancedManagerViewClose');
			}
		}
	});

})();
