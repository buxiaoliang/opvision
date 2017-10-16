(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.workflowForm.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.common.workflowForm.Grid'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.WorkflowForm}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.plugin.CellEditing}
		 */
		gridEditorPlugin: undefined,

		title: CMDBuild.Translation.workflowAttributes,
		considerAsFieldToDisable: true,
		margin: '0 10 5 0',
		minWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,

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
						me.delegate.cmOn('onBeforeEdit', {
							fieldName: e.field,
							rowData: e.record.data
						});
					}
				}
			});

			Ext.apply(this, {
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
									me.store.insert(0, Ext.create('CMDBuild.model.administration.taskManager.task.common.workflowForm.Grid'));
								}
							}
						]
					}
				],
				columns: [
					{
						header: CMDBuild.Translation.name,
						dataIndex: CMDBuild.core.constants.Proxy.NAME,
						flex: 1,

						editor: { xtype: 'textfield' }
					},
					{
						header: CMDBuild.Translation.value,
						dataIndex: CMDBuild.core.constants.Proxy.VALUE,
						flex: 1,

						editor: { xtype: 'textfield' }
					},
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
									grid.store.remove(record);
								}
							}
						]
					}
				],
				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.administration.taskManager.task.common.workflowForm.Grid',
					data: []
				}),
				plugins: [this.gridEditorPlugin]
			});

			this.callParent(arguments);
		}
	});

})();
