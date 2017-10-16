(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick',
			'onWorkflowTreeFilterAdvancedFilterEditorApplyButtonClick',
			'onWorkflowTreeFilterAdvancedFilterEditorSaveAndApplyButtonClick',
			'onWorkflowTreeFilterAdvancedFilterEditorViewHide',
			'onWorkflowTreeFilterAdvancedFilterEditorViewShow'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.Attributes}
		 */
		controllerAttributes: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations}
		 */
		controllerRelations: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditorWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditorWindow', { delegate: this });

			// Build sub controllers
			this.controllerAttributes = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.Attributes', { parentDelegate: this });
			this.controllerRelations = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations', { parentDelegate: this });

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
			if (!this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION]))
				return this.view.wrapper.setActiveTab(1);

			this.view.wrapper.setActiveTab(0);

			return disableFireEvent ? null : this.view.wrapper.getActiveTab().fireEvent('show'); // Manual show event fire
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorApplyButtonClick: function () {
			var filterModelObject = this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.Object.merge(
				this.controllerAttributes.cmfg('workflowTreeFilterAdvancedFilterEditorAttributesDataGet'),
				this.controllerRelations.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsDataGet')
			);

			// If new filter model
			if (Ext.isEmpty(filterModelObject[CMDBuild.core.constants.Proxy.ID])) {
				filterModelObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = CMDBuild.Translation.newSearchFilter;
				filterModelObject[CMDBuild.core.constants.Proxy.NAME] = CMDBuild.Translation.newSearchFilter;
			}

			this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });

			// Save filter in local storage
			if (this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty', CMDBuild.core.constants.Proxy.ID))
				this.cmfg('workflowTreeFilterAdvancedLocalFilterAdd', this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));

			this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick'); // Close filter editor view
			this.cmfg('workflowTreeFilterAdvancedManagerViewClose'); // Close manager view
			this.cmfg('onWorkflowTreeFilterAdvancedFilterSelect', this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet')); // Apply filter to store
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorSaveAndApplyButtonClick: function () {
			var filterModelObject = this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet').getData();
			filterModelObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = Ext.Object.merge(
				this.controllerAttributes.cmfg('workflowTreeFilterAdvancedFilterEditorAttributesDataGet'),
				this.controllerRelations.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsDataGet')
			);

			this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', { value: filterModelObject });
			this.cmfg('workflowTreeFilterAdvancedManagerSave', { enableApply: true });
		},

		/**
		 * Reset manage toggle button on window hide with no filters in manager store
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorViewHide: function () {
			if (this.cmfg('workflowTreeFilterAdvancedManagerStoreIsEmpty'))
				this.cmfg('workflowTreeFilterAdvancedManageToggleStateReset');
		},

		/**
		 * Show event forwarder method
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorViewShow: function () {
			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'workflowTreeFilterAdvancedFilterEditorBarrier',
				scope: this,
				callback: function () {
					this.setViewTitle([
						this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet', CMDBuild.core.constants.Proxy.NAME),
						this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					]);

					this.manageActiveTabSet();
				}
			});

			this.controllerAttributes.cmfg('onWorkflowTreeFilterAdvancedFilterEditorAttributesInit', {
				callback: requestBarrier.getCallback('workflowTreeFilterAdvancedFilterEditorBarrier')
			});

			this.controllerRelations.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsInit', {
				callback: requestBarrier.getCallback('workflowTreeFilterAdvancedFilterEditorBarrier')
			});

			requestBarrier.finalize('workflowTreeFilterAdvancedFilterEditorBarrier', true);
		}
	});

})();
