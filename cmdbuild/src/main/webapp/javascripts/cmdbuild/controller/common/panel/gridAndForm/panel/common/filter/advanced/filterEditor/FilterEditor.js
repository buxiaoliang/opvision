(function () {

	/**
	 * @link CMDBuild.controller.common.field.filter.advanced.window.Window
	 * @link CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.FilterEditor', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelGridAndFormFilterAdvancedFilterEditorAbortButtonClick',
			'onPanelGridAndFormFilterAdvancedFilterEditorApplyButtonClick',
			'onPanelGridAndFormFilterAdvancedFilterEditorSaveAndApplyButtonClick',
			'onPanelGridAndFormFilterAdvancedFilterEditorViewHide',
			'onPanelGridAndFormFilterAdvancedFilterEditorViewShow'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.Attributes}
		 */
		controllerAttributes: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.Relations}
		 */
		controllerRelations: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.FilterEditorWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.FilterEditorWindow', { delegate: this });

			// Build sub controllers
			this.controllerAttributes = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.Attributes', { parentDelegate: this });
			this.controllerRelations = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.Relations', { parentDelegate: this });

			this.view.wrapper.removeAll();
			this.view.wrapper.add([
				this.controllerAttributes.getView(),
				this.controllerRelations.getView()
			]);

			this.manageActiveTabSet(true);
		},

		/**
		 * @param {Boolean} disableFireEvent
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageActiveTabSet: function (disableFireEvent) {
			if (!this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterIsEmpty', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION]))
				return this.view.wrapper.setActiveTab(1);

			this.view.wrapper.setActiveTab(0);

			return disableFireEvent ? null : this.view.wrapper.getActiveTab().fireEvent('show'); // Manual show event fire
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorApplyButtonClick: function () {
			var filterModelObject = this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.Object.merge(
				this.controllerAttributes.cmfg('panelGridAndFormFilterAdvancedFilterEditorAttributesDataGet'),
				this.controllerRelations.cmfg('panelGridAndFormFilterAdvancedFilterEditorRelationsDataGet')
			);

			// If new filter model
			if (Ext.isEmpty(filterModelObject[CMDBuild.core.constants.Proxy.ID])) {
				filterModelObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = CMDBuild.Translation.newSearchFilter;
				filterModelObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.newSearchFilter;
			}

			this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });

			// Save filter in local storage
			if (this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterIsEmpty', CMDBuild.core.constants.Proxy.ID))
				this.cmfg('panelGridAndFormFilterAdvancedLocalFilterAdd', this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet'));

			this.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
			this.cmfg('panelGridAndFormFilterAdvancedManagerViewClose'); // Close manager view
			this.cmfg('onPanelGridAndFormFilterAdvancedFilterSelect', this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet')); // Apply filter to store
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorSaveAndApplyButtonClick: function () {
			var filterModelObject = this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.Object.merge(
				this.controllerAttributes.cmfg('panelGridAndFormFilterAdvancedFilterEditorAttributesDataGet'),
				this.controllerRelations.cmfg('panelGridAndFormFilterAdvancedFilterEditorRelationsDataGet')
			);

			this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });
			this.cmfg('panelGridAndFormFilterAdvancedManagerSave', { enableApply: true });
		},

		/**
		 * Reset manage toggle button on window hide with no filters in manager store
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorViewHide: function () {
			if (this.cmfg('panelGridAndFormFilterAdvancedManagerStoreIsEmpty'))
				this.cmfg('panelGridAndFormFilterAdvancedManageToggleStateReset');
		},

		/**
		 * Show event forwarder method
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorViewShow: function () {
			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'panelGridAndFormFilterAdvancedFilterEditorBarrier',
				scope: this,
				callback: function () {
					this.setViewTitle([
						this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet', CMDBuild.core.constants.Proxy.NAME),
						this.cmfg('panelGridAndFormFilterAdvancedEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					]);

					this.manageActiveTabSet();
				}
			});

			this.controllerAttributes.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorAttributesInit', {
				callback: requestBarrier.getCallback('panelGridAndFormFilterAdvancedFilterEditorBarrier')
			});

			this.controllerRelations.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorRelationsInit', {
				callback: requestBarrier.getCallback('panelGridAndFormFilterAdvancedFilterEditorBarrier')
			});

			requestBarrier.finalize('panelGridAndFormFilterAdvancedFilterEditorBarrier', true);
		}
	});

})();
