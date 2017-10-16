(function () {

	Ext.define('CMDBuild.view.management.widget.navigationTree.TreePanel', {
		extend: 'Ext.tree.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.widget.NavigationTree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.widget.navigationTree.NavigationTree}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		rootVisible: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						xtype: 'treecolumn',
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.navigationTree,
						menuDisabled: true,
						resizable: false,
						flex: 1
					}
				],
				store: CMDBuild.proxy.management.widget.NavigationTree.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			checkchange: function (node, checked, eOpts) {
				this.delegate.cmfg('onWidgetNavigationTreeCheckChange', {
					checked: checked,
					node: node
				});
			},
			itemexpand: function (node, eOpts) {
				this.delegate.cmfg('onWidgetNavigationTreeNodeExpand', node);
			}
		}
	});

})();
