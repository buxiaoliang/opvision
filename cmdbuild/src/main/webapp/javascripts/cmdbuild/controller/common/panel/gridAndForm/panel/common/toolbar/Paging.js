(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- onPanelGridAndFormCommonToolbarPrintButtonClick
	 * 	- panelGridAndFormListPanelAppliedFilterGet
	 * 	- panelGridAndFormListPanelAppliedFilterIsEmpty
	 * 	- panelGridAndFormListPanelStoreGet
	 * 	- panelGridAndFormListPanelStoreLoad
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormUiUpdate
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormCommonToolbarPagingFilterBasicReset',
			'panelGridAndFormCommonToolbarPagingUiUpdate'
		],

		/**
		 * @property {CMDBuild.controller.common.field.filter.basic.Basic}
		 */
		controllerFilterBasic: undefined,

		/**
		 * @cfg {Boolean}
		 */
		disableFilterBasic: false,

		/**
		 * @cfg {CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 * @param {Boolean} configurationObject.enableFilterAdvanced
		 * @param {Boolean} configurationObject.enableFilterBasic
		 * @param {Boolean} configurationObject.enableButtonPrint
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub-controllers
			this.controllerFilterBasic = Ext.create('CMDBuild.controller.common.field.filter.basic.Basic', { parentDelegate: this });

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				delegate: this,
				store: this.cmfg('panelGridAndFormListPanelStoreGet'),
				items: [
					{ xtype: 'tbseparator' },
					this.controllerFilterBasic.getView()
				]
			});
		},

		/**
		 * @returns {Void}
		 */
		panelGridAndFormCommonToolbarPagingFilterBasicReset: function () {
			this.controllerFilterBasic.cmfg('onFieldFilterBasicReset', true);
		}
	});

})();
