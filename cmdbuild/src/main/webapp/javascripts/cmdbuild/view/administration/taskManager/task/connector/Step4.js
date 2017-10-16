(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.connector.Step4', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.connector.ClassLevel'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Step4}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.Panel}
		 */
		classLevelMappingGrid: undefined,

		/**
		 * @property {Ext.grid.plugin.CellEditing}
		 */
		gridEditorPlugin: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			var me = this;

			this.gridEditorPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 1,

				listeners: {
					beforeedit: function (editor, e, eOpts) {
						me.delegate.cmfg('onBeforeEdit', {
							fieldName: e.field,
							rowData: e.record.data
						});
					}
				}
			});

			this.classLevelMappingGrid = Ext.create('Ext.grid.Panel', {
				title: CMDBuild.Translation.classMapping,
				considerAsFieldToDisable: true,
				margin: '0 0 5 0',
				minWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,

				plugins: [this.gridEditorPlugin],

				columns: [
					{
						header: CMDBuild.Translation.externalEntity,
						dataIndex: CMDBuild.core.constants.Proxy.SOURCE_NAME,
						editor: {
							xtype: 'combo',
							displayField: CMDBuild.core.constants.Proxy.NAME,
							valueField: CMDBuild.core.constants.Proxy.NAME,

							store: CMDBuild.proxy.administration.taskManager.task.Connector.getStoreSource(),

							listeners: {
								select: function (combo, records, eOpts) {
									me.delegate.cmfg('onStepEdit');
								}
							}
						},
						flex: 1
					},
					{
						header: CMDBuild.Translation.cmdBuildClass,
						dataIndex: CMDBuild.core.constants.Proxy.CLASS_NAME,
						editor: {
							xtype: 'combo',
							displayField: CMDBuild.core.constants.Proxy.TEXT,
							valueField: CMDBuild.core.constants.Proxy.NAME,
							forceSelection: true,
							editable: false,
							allowBlank: false,

							store: CMDBuild.proxy.administration.taskManager.task.Connector.getStoreClasses(),
							queryMode: 'local',

							listeners: {
								select: function (combo, records, eOpts) {
									me.delegate.cmfg('onStepEdit');
								}
							}
						},
						flex: 1
					},
					{
						xtype: 'checkcolumn',
						header: CMDBuild.Translation.createLabel,
						dataIndex: CMDBuild.core.constants.Proxy.CREATE,
						width: 60,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true
					},
					{
						xtype: 'checkcolumn',
						header: CMDBuild.Translation.updateLabel,
						dataIndex: CMDBuild.core.constants.Proxy.UPDATE,
						width: 60,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true
					},
					{
						xtype: 'checkcolumn',
						header: CMDBuild.Translation.deleteLabel,
						dataIndex: CMDBuild.core.constants.Proxy.DELETE,
						width: 60,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						listeners: {
							checkchange: function (checkbox, rowIndex, checked, eOpts) {
								me.delegate.cmfg('onCheckDelete', {
									checked: checked,
									rowIndex: rowIndex
								});
							}
						}
					},
// TODO: future implementation
//					{
//						header: CMDBuild.Translation.deletionType,
//						dataIndex: CMDBuild.core.constants.Proxy.DELETE_TYPE,
//						editor: {
//							xtype: 'combo',
//							disabled: true
//						},
//						width: 120
//					},
					{
						xtype: 'actioncolumn',
						width: 30,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						items: [
							{
								icon: 'images/icons/cross.png',
								tooltip: CMDBuild.Translation.remove,
								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									me.classLevelMappingGrid.store.remove(record);
								}
							}
						]
					}
				],

				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.administration.taskManager.task.connector.ClassLevel',
					data: []
				}),

				dockedItems: [
					{
						xtype: 'toolbar',
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,
						items: [
							{
								text: CMDBuild.Translation.add,
								iconCls: 'add',
								handler: function () {
									me.classLevelMappingGrid.store.insert(0, Ext.create('CMDBuild.model.administration.taskManager.task.connector.ClassLevel'));
								}
							}
						]
					}
				]
			});

			Ext.apply(this, {
				items: [this.classLevelMappingGrid]
			});

			this.callParent(arguments);
		},

		listeners: {
			/**
			 * Disable next button only if grid haven't selected class
			 */
			activate: function (view, eOpts) {
				Ext.Function.createDelayed(function () { // HACK: to fix problem which fires show event before changeTab() function
					if (this.delegate.isEmptyMappingGrid())
						this.delegate.setDisabledButtonNext(true);
				}, 1, this)();
			}
		}
	});

})();
