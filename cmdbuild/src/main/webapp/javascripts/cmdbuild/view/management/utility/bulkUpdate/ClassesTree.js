(function () {

	Ext.define('CMDBuild.view.management.utility.bulkUpdate.ClassesTree', {
		extend: 'Ext.tree.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.utility.BulkUpdate'
		],

		/**
		 * @cfg {CMDBuild.controller.management.utility.bulkUpdate.BulkUpdate}
		 */
		delegate: undefined,

		border: true,
		forceFit: true,
		frame: false,
		hideHeaders: true,
		rootVisible: false,
		scroll: 'vertical',

		bodyStyle: {
			background: '#ffffff'
		},

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
						dataIndex: CMDBuild.core.constants.Proxy.TEXT,
						draggable: false,
						flex: true,
						hideable: false,
						sortable: false
					}
				],
				store: CMDBuild.proxy.utility.BulkUpdate.getStoreClassesTree()
			});

			this.callParent(arguments);
		},

		listeners: {
			beforeselect: function (panel, record, index, eOpts) {
				return this.delegate.cmfg('onUtilityBulkUpdateClassBeforeSelect', record);
			},
			selectionchange: function (panel, selected, eOpts) {
				this.delegate.cmfg('onUtilityBulkUpdateClassSelected', selected[0]);
			}
		}
	});

})();
