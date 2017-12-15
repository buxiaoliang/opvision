(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.TreePanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.tree.TreePanel',

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.workflow.panel.tree.Tree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.Tree}
		 */
		delegate: undefined,

		columns: [],
		lines: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.management.workflow.panel.tree.Tree.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			beforeitemclick: function (view, record, item, index, e, eOpts) {
				this.delegate.cmfg('onWorkflowTreeBeforeItemClick', record);
			},
			columnhide: function (ct, column, eOpts) {
				this.delegate.cmfg('onWorkflowTreeColumnChanged');
			},
			columnshow: function (ct, column, eOpts) {
				this.delegate.cmfg('onWorkflowTreeColumnChanged');
			},
			itemdblclick: function (grid, record, item, index, e, eOpts) {
				this.isDblClick = true;
				record.set("openInEditMode", true);
				this.delegate.cmfg('onWorkflowTreeRecordSelect', record);
			},
			select: function (row, record, index) {
				var me = this;
				this.isDblClick = false;
				// this has been done to allow double click on grid items
				setTimeout(function() {
					if (!me.isDblClick) {
						me.delegate.cmfg('onWorkflowTreeRecordSelect', record);
					}
				}, 800);
			},
			sortchange: function (ct, column, direction, eOpts) {
				this.delegate.cmfg('onWorkflowTreeSortChange');
			}
		}
	});

})();
