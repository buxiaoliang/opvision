(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.toolbar.Paging', {
		extend: 'Ext.toolbar.Paging',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.toolbar.Paging}
		 */
		delegate: undefined,

		/**
		 * @cfg {Ext.data.Store or Ext.data.TreeStore}
		 */
		store: undefined,

		dock: 'bottom',
		displayInfo: true,
		displayMsg: '{0} - {1} ' + CMDBuild.Translation.of + ' {2}',
		emptyMsg: CMDBuild.Translation.noTopicsToDisplay,

		/**
		 * @param {Number} page
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		customLoadMethod: function (page) {
			return this.delegate.cmfg('workflowTreeStoreLoad', {
				page: page,
				params: this.store.getProxy().extraParams
			});
		},

		listeners: {
			show: function (toolbar, eOpts) {
				this.delegate.cmfg('onWorkflowTreeToolbarPagingShow');
			}
		}
	});

})();
