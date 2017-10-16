(function () {

	/**
	 * @legacy
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.toolbar.Paging', {
		extend: 'Ext.toolbar.Paging',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		delegate: undefined,

		/**
		 * @cfg {Ext.data.Store or Ext.data.TreeStore}
		 */
		store: undefined,

		displayInfo: true,
		displayMsg: '{0} - {1} ' + CMDBuild.Translation.of + ' {2}',
		dock: 'bottom',
		emptyMsg: CMDBuild.Translation.noTopicsToDisplay,

		/**
		 * @param {Number} page
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		customLoadMethod: function (page) {
			return this.delegate.cmfg('panelGridAndFormListPanelStoreLoad', {
				page: page,
				params: this.delegate.cmfg('panelGridAndFormListPanelStoreGet').getProxy().extraParams
			});
		}
	});

})();
