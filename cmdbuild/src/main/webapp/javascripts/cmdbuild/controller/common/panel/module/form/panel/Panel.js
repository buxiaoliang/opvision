(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedItemAttributesGet
	 * 	- panelGridAndFormSelectedItemAttributesIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 * 	- panelGridAndFormSelectedPreviousItemGet
	 * 	- panelGridAndFormSelectedPreviousItemIsEmpty
	 * 	- panelGridAndFormViewModeEquals
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.panel.Panel', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		mixins: ['CMDBuild.controller.common.panel.gridAndForm.panel.mixins.PanelFunctions'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormMixinsPanelFunctionsDataGet = panelModulePanelFunctionsDataGet',
			'panelGridAndFormMixinsPanelFunctionsIsValid = panelModulePanelFunctionsIsValid',
			'panelModuleFormPanelDisable',
			'panelModuleFormPanelFieldsBuild',
			'panelModuleFormPanelFieldsDataGet',
			'panelModuleFormPanelFieldsDataSet',
			'panelModuleFormPanelFormGet',
			'panelModuleFormPanelReset',
			'panelModuleFormPanelUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.module.form.panel.FieldsTab}
		 */
		controllerPanelTab: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.form.toolbar.Bottom}
		 */
		controllerToolbarBottom: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.form.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			panelTab: 'CMDBuild.controller.common.panel.module.form.panel.FieldsTab',
			toolbarBottom: 'CMDBuild.controller.common.panel.module.form.toolbar.Bottom',
			toolbarTop: 'CMDBuild.controller.common.panel.module.form.toolbar.Top',
			view: 'CMDBuild.view.common.panel.module.form.panel.PanelView'
		},

		/**
		 * @property {CMDBuild.view.common.panel.module.form.panel.PanelView}
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
			this.controllerPanelTab = Ext.create(this.subClassesNames.panelTab, { parentDelegate: this });
			this.controllerToolbarBottom = Ext.create(this.subClassesNames.toolbarBottom, { parentDelegate: this });
			this.controllerToolbarTop = Ext.create(this.subClassesNames.toolbarTop, { parentDelegate: this });

			// Add docked
			this.view.addDocked([
				this.controllerToolbarBottom.getView(),
				this.controllerToolbarTop.getView(),
			]);

			// Build view
			this.view.add([
				this.controllerPanelTab.getView()
			]);
		},

		/**
		 * Custom disable behaviour wich just clear all tab and disable toolbars
		 *
		 * @returns {Void}
		 */
		panelModuleFormPanelDisable: function () {
			this.controllerPanelTab.cmfg('panelModuleFormPanelTabReset');
			this.controllerToolbarBottom.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: true });
			this.controllerToolbarTop.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: true });
		},

		/**
		 * @param {Object} parameters
		 * @param {Object or String or Number} parameters.subTabToSelect
		 *
		 * @returns {Void}
		 */
		panelModuleFormPanelFieldsBuild: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Forward to sub-controllers
			this.controllerPanelTab.cmfg('panelModuleFormPanelTabFieldsBuild', parameters);
		},

		/**
		 * @returns {Object}
		 */
		panelModuleFormPanelFieldsDataGet: function () {
			return this.view.getValues();
		},

		/**
		 * @param {Object} values
		 */
		panelModuleFormPanelFieldsDataSet: function (values) {
			var requestBarrier = Ext.create('CMDBuild.core.RequestBarrier', {
				id: 'templateResolverBarrier',
				scope: this,
				callback: function () {
					var onlyChangedValues = diff(this.values, values);
					if (! Ext.isEmpty(onlyChangedValues)) {
						this.view.getForm().setValues(onlyChangedValues);
					} else {
						console.debug("Warning: changed reference values", onlyChangedValues);
					}
				}
			});
			this.values = values;
			this.view.getForm().setValues(values);

			// FIXME: waiting for refactor (field reference)
			this.view.getForm().getFields().each(function (field, i, allFields) {
				if (
					Ext.isObject(field) && !Ext.Object.isEmpty(field)
					&& Ext.isObject(field.templateResolver) && !Ext.Object.isEmpty(field.templateResolver)
				) {
					field.templateResolver.serverVars = values;
					field.resolveTemplate({
						iden: field.name,
						callback: requestBarrier.getCallback('templateResolverBarrier')
					});
				}
			}, this);

			requestBarrier.finalize('templateResolverBarrier', true);
		},

		/**
		 * @returns {Ext.form.Basic}
		 */
		panelModuleFormPanelFormGet: function () {
			return this.view.getForm();
		},

		/**
		 * @returns {Void}
		 */
		panelModuleFormPanelReset: function () {
			// Forward to sub-controllers
			this.controllerPanelTab.cmfg('panelModuleFormPanelTabReset');
			this.controllerToolbarBottom.cmfg('panelModuleFormToolbarBottomReset');
			this.controllerToolbarTop.cmfg('panelModuleFormToolbarTopReset');
		},

		/**
		 * @returns {Void}
		 */
		panelModuleFormPanelUiUpdate: function () {
			// Forward to sub-controllers
			this.controllerToolbarBottom.cmfg('panelModuleFormToolbarBottomUiUpdate');
			this.controllerToolbarTop.cmfg('panelModuleFormToolbarTopUiUpdate');
		}
	});
	function diff(orig, changed) {
		var ret = {};
		for (var key in changed) {
			if (changed[key] != orig[key]) {
				ret[key] = changed[key];
			}
		}
		return ret;
	}
})();
