(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step6', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.connector.ReferenceLevel'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Step6}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.plugin.CellEditing}
		 */
		gridEditorPlugin: undefined,

		/**
		 * @property {Ext.grid.Panel}
		 */
		referenceMappingGrid: undefined,

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

			this.referenceMappingGrid = Ext.create('Ext.grid.Panel', {
				title: CMDBuild.Translation.referencesMapping,
				considerAsFieldToDisable: true,
				margin: '0 0 5 0',
				minWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,

				plugins: [this.gridEditorPlugin],

				columns: [
					{
						header: CMDBuild.Translation.cmdBuildClass,
						dataIndex: CMDBuild.core.constants.Proxy.CLASS_NAME,
						editor: {
							xtype: 'combo',
							disabled: true
						},
						flex: 1
					},
					{
						header: CMDBuild.Translation.domainName,
						dataIndex: CMDBuild.core.constants.Proxy.DOMAIN_NAME,
						editor: {
							xtype: 'combo',
							disabled: true
						},
						flex: 1
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
									me.referenceMappingGrid.store.remove(record);
								}
							}
						]
					}
				],

				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.administration.taskManager.task.connector.ReferenceLevel',
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
									me.referenceMappingGrid.store.insert(0, Ext.create('CMDBuild.model.administration.taskManager.task.connector.ReferenceLevel'));
								}
							}
						]
					}
				]
			});

			Ext.apply(this, {
				items: [this.referenceMappingGrid]
			});

			this.callParent(arguments);
		},

		listeners: {
			/**
			 * To populate grid with selected classes
			 *
			 * @param {Object} view
			 * @param {Object} eOpts
			 */
			activate: function (view, eOpts) {
				this.delegate.buildClassCombo();

				// Step validate
				this.delegate.parentDelegate.validateStepGrid(this.referenceMappingGrid.getStore());
			}
		}
	});

})();
