(function () {

	Ext.define('CMDBuild.view.administration.domain.tabs.enabledClasses.TreePanel', {
		extend: 'Ext.tree.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.domain.tabs.enabledClasses.TreeStore'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.domain.tabs.EnabledClasses}
		 */
		delegate: undefined,

		autoScroll: true,
		border: true,
		collapsible: false,
		considerAsFieldToDisable: true,
		enableColumnHide: false,
		flex: 1,
		frame: false,
		hideCollapseTool: true,
		rootVisible: false,
		sortableColumns: false, // BUGGED in ExtJs 4.2, workaround setting sortable: false to columns

		viewConfig: {
			markDirty: false // Workaround to avoid dirty mark on hidden checkColumn cells
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
						text: CMDBuild.Translation.className,
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						flex: 1,
						sortable: false,
						draggable: false
					},
					Ext.create('Ext.grid.column.CheckColumn', {
						text: CMDBuild.Translation.enabled,
						dataIndex: CMDBuild.core.constants.Proxy.ENABLED,
						width: 60,
						align: 'center',
						enableCheckboxHide: true,
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						isCheckboxHidden: function (value, meta, record, rowIndex, colIndex, store, view) {
							return record.childNodes.length > 0;
						}
					})
				],
				store: Ext.create('Ext.data.TreeStore', {
					model: 'CMDBuild.model.administration.domain.tabs.enabledClasses.TreeStore',
					root: {
						text: 'ROOT',
						expanded: true,
						children: []
					},
					sorters: [
						{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
					]
				})
			});

			this.callParent(arguments);
		},

		/**
		 * SetDisabled state only if tree has more than one node, otherwise tree still disabled
		 *
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		setDisabled: function (state) {
			if (
				Ext.isEmpty(this.getStore().getRootNode().childNodes)
				|| ( // if root has more than one child and that child is not a superclass
					this.getStore().getRootNode().childNodes.length <= 1
					&& this.getStore().getRootNode().getChildAt(0).isLeaf()
				)
			) {
				return this.callParent([true]);
			} else {
				return this.callParent(arguments);
			}
		}
	});

})();
