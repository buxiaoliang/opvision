(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 * 	- panelGridAndFormViewModeGet
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.toolbar.Top', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.gridAndForm.Top',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormMixinsToolbarFunctionsDisabledStateSet = panelModuleFormPanelToolbarTopDisabledStateSet',
			'panelModuleFormToolbarTopReset',
			'panelModuleFormToolbarTopUiUpdate'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.common.panel.module.form.toolbar.TopView'
		},

		/**
		 * @cfg {CMDBuild.view.common.panel.module.form.toolbar.TopView}
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
		panelModuleFormToolbarTopReset: function () {
			this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: true });
		},

		/**
		 * General implementation to override on specific contexts
		 *
		 * @returns {Void}
		 */
		panelModuleFormToolbarTopUiUpdate: function () {
			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'edit':
					return this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: this.cmfg('panelGridAndFormSelectedEntityIsEmpty') });

				case 'readOnly':
					return this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: true });

				case 'read':
				default:
					return this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', {
						state: (
							this.cmfg('panelGridAndFormSelectedEntityIsEmpty')
							|| this.cmfg('panelGridAndFormSelectedItemIsEmpty')
							|| !this.cmfg('panelGridAndFormSelectedEntityGet', [CMDBuild.core.constants.Proxy.PERMISSIONS, CMDBuild.core.constants.Proxy.WRITE])
						)
					});
			}
		}
	});

})();
