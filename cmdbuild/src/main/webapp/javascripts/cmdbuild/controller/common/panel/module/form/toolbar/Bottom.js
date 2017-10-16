(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- onPanelModuleFormToolbarBottomSaveButtonClick
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 * 	- panelGridAndFormSelectedPreviousItemGet
	 * 	- panelGridAndFormSelectedPreviousItemIsEmpty
	 * 	- panelGridAndFormUiUpdate
	 * 	- panelGridAndFormViewModeGet
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.toolbar.Bottom', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.gridAndForm.Bottom',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleFormToolbarBottomAbortButtonClick',
			'panelGridAndFormMixinsToolbarFunctionsDisabledStateSet = panelModuleFormPanelToolbarBottomDisabledStateSet',
			'panelModuleFormToolbarBottomReset',
			'panelModuleFormToolbarBottomUiUpdate'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.common.panel.module.form.toolbar.BottomView'
		},

		/**
		 * @cfg {CMDBuild.view.common.panel.module.form.toolbar.BottomView}
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
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleFormToolbarBottomAbortButtonClick: function () {
			var params = {};

			if (!this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add': {
					if (!this.cmfg('panelGridAndFormSelectedPreviousItemIsEmpty')) {
						params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
						params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('panelGridAndFormSelectedPreviousItemGet', CMDBuild.core.constants.Proxy.ID);
					}
				} break;

				case 'edit': {
					if (!this.cmfg('panelGridAndFormSelectedItemIsEmpty')) {
						params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
						params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
					}
				} break;
			}

			this.cmfg('panelGridAndFormUiUpdate', params);
		},

		/**
		 * @returns {Void}
		 */
		panelModuleFormToolbarBottomReset: function () {
			this.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: true });
		},

		/**
		 * @returns {Void}
		 */
		panelModuleFormToolbarBottomUiUpdate: function () {
			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'edit':
					return this.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: false });

				case 'read':
				case 'readOnly':
				default:
					return this.cmfg('panelModuleFormPanelToolbarBottomDisabledStateSet', { state: true });
			}
		}
	});

})();
