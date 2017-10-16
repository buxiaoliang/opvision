(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- onPanelModuleFormToolbarBottomSaveButtonClick
	 * 	- panelGridAndFormPanelWidgetGet
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemAttributesGet
	 * 	- panelGridAndFormSelectedItemAttributesIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 * 	- panelGridAndFormSelectedPreviousItemGet
	 * 	- panelGridAndFormSelectedPreviousItemIsEmpty
	 * 	- panelGridAndFormTabPanelGet
	 * 	- panelGridAndFormUiUpdate
	 * 	- panelGridAndFormViewModeEquals
	 * 	- panelGridAndFormViewModeGet
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.Tab', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @property {Boolean} For avoid the loading of the card in editing
		 */
		inEditing : false,
		previousCard : undefined,

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleFormTabShow',
			'panelModuleFormFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'panelModuleFormTabDisable',
			'panelModuleFormTabReset'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.module.form.panel.Panel}
		 */
		controllerForm: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup}
		 */
		controllerPanelWidget: undefined,

		/**
		 * Definitions of all sub-classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			form: 'CMDBuild.controller.common.panel.module.form.panel.Panel',
			panelWidget: 'CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup',
			view: 'CMDBuild.view.common.panel.module.form.TabView',
		},

		/**
		 * @property {CMDBuild.view.common.panel.module.form.TabView}
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

			this.view = Ext.create(this.subClassesNames.view, { delegate: this });

			// Build sub-controllers
			this.controllerForm = Ext.create(this.subClassesNames.form, { parentDelegate: this });
			this.controllerPanelWidget = Ext.create(this.subClassesNames.panelWidget, { parentDelegate: this });

			// View build
			this.view.add([
				this.controllerForm.getView(),
				this.controllerPanelWidget.getView()
			]);
		},

		/**
		 * @returns {Object}
		 */
		buildValues: function () {
			if (!this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
				return this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.VALUES);

			return {};
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 * @param {Object or String or Number} parameters.subTabToSelect
		 *
		 * @returns {Void}
		 *
		 * @abstract
		 */
		onPanelModuleFormTabShow: function (parameters) {
			Ext.resumeLayouts();
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Forward to sub-controllers
			var id = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			var activityId = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
			if ((! this.previousCard || this.previousCard.id != id) || (activityId && activityId !== this.previousCard.activityId)) {
				this.inEditing = false;
			}
			this.cmfg('tabEmailEditModeSet', true);
			this.previousCard = {
					id : id,
					activityId : activityId
			};
			var bEditing = (this.viewMode === 'edit' || this.viewMode === 'add');
			if (! this.inEditing) {
				this.controllerForm.cmfg('panelModuleFormPanelFieldsBuild', { subTabToSelect: parameters.subTabToSelect });
				this.controllerForm.cmfg('panelModuleFormPanelFieldsDataSet', this.buildValues());
			}
			else {
				
			}
			this.inEditing = bEditing;

			if (Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, parameters.scope);
		},

		/**
		 * Custom disable behaviour which just clear all tab and disable toolbars
		 *
		 * @returns {Void}
		 */
		panelModuleFormTabDisable: function () {
			// Forward to sub-controllers
			this.controllerForm.cmfg('panelModuleFormPanelDisable');
		},

		/**
		 * Form for TempalteResolver
		 *
		 * @returns {Ext.form.Basic}
		 */
		panelModuleFormFormGet: function () {
			// Forward to sub-controllers
			return this.controllerForm.cmfg('panelModuleFormPanelFormGet');
		},

		/**
		 * Disable tab only because of preserve active tab selection over tab rebuild requirement
		 *
		 * @returns {Void}
		 */
		panelModuleFormTabReset: function () {
			this.cmfg('panelModuleFormTabDisable');

			// Forward to sub-controllers
			this.controllerForm.cmfg('panelModuleFormPanelReset');
			this.controllerPanelWidget.cmfg('panelModuleWidgetButtonGroupReset');
		}
	});

})();
