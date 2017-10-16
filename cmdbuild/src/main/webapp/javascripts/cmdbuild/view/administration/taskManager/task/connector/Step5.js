(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.connector.Step5', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.connector.AttributeLevel'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Step5}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.Panel}
		 */
		attributeLevelMappingGrid: undefined,

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

			this.classesAttributesMap = _CMCache.getAllAttributesList();

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

			this.attributeLevelMappingGrid = Ext.create('Ext.grid.Panel', {
				title: CMDBuild.Translation.attributeMapping,
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
							disabled: true
						},
						flex: 1
					},
					{
						header: CMDBuild.Translation.externalAttribute,
						dataIndex: CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE,
						editor: {
							xtype: 'combo',
							disabled: true
						},
						flex: 1
					},
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
						header: CMDBuild.Translation.cmdBuildAttribute,
						dataIndex: CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE,
						editor: {
							xtype: 'combo',
							disabled: true
						},
						flex: 1
					},
					{
						xtype: 'checkcolumn',
						header: CMDBuild.Translation.isKey,
						dataIndex: CMDBuild.core.constants.Proxy.IS_KEY,
						width: 50,
						align: 'center',
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true
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
									me.attributeLevelMappingGrid.store.remove(record);
								}
							}
						]
					}
				],

				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.administration.taskManager.task.connector.AttributeLevel',
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
									me.attributeLevelMappingGrid.store.insert(0, Ext.create('CMDBuild.model.administration.taskManager.task.connector.AttributeLevel'));
								}
							}
						]
					}
				]
			});

			Ext.apply(this, {
				items: [this.attributeLevelMappingGrid]
			});

			this.callParent(arguments);
		},

		listeners: {
			/**
			 * Disable next button only if grid haven't selected class and setup class and source combo editors
			 *
			 * @param {Object} view
			 * @param {Object} eOpts
			 */
			activate: function (view, eOpts) {
				this.delegate.buildSourceCombo();
				this.delegate.buildClassCombo();

				// Step validate
				this.delegate.parentDelegate.validateStepGrid(this.attributeLevelMappingGrid.getStore());

				Ext.Function.createDelayed(function () { // HACK: to fix problem witch fires show event before changeTab() function
					if (this.delegate.isEmptyMappingGrid())
						this.delegate.setDisabledButtonNext(true);
				}, 1, this)();
			}
		}
	});

})();