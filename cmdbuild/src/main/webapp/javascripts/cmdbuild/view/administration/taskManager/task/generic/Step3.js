(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.generic.Step3', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.generic.Context'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Step3}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.Panel}
		 */
		grid: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.grid = Ext.create('Ext.grid.Panel', {
						title: CMDBuild.Translation.contextVariables,
						considerAsFieldToDisable: true,

						columns: [
							{
								dataIndex: CMDBuild.core.constants.Proxy.KEY,
								text: CMDBuild.Translation.key,
								flex: 1,

								editor: {
									xtype: 'textfield',
									vtype: 'alphanumlines'
								}
							},
							{
								dataIndex: CMDBuild.core.constants.Proxy.VALUE,
								text: CMDBuild.Translation.value,
								flex: 1,

								editor: { xtype: 'textfield' }
							},
							Ext.create('Ext.grid.column.Action', {
								align: 'center',
								width: 30,
								sortable: false,
								hideable: false,
								menuDisabled: true,
								fixed: true,

								items: [
									Ext.create('CMDBuild.core.buttons.iconized.Remove', {
										withSpacer: true,
										tooltip: CMDBuild.Translation.remove,
										scope: this,

										handler: function (view, rowIndex, colIndex, item, e, record) {
											this.delegate.cmfg('onTaskManagerFormTaskGenericStep3DeleteRowButtonClick', record);
										}
									})
								]
							})
						],

						plugins: [
							Ext.create('Ext.grid.plugin.CellEditing', { clicksToEdit: 1 })
						],

						store: Ext.create('Ext.data.Store', {
							model: 'CMDBuild.model.administration.taskManager.task.generic.Context',
							data: []
						}),

						dockedItems: [
							Ext.create('Ext.toolbar.Toolbar', {
								dock: 'top',
								itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

								items: [
									Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
										scope: this,

										handler: function (buttons, e) {
											this.grid.getStore().insert(0, Ext.create('CMDBuild.model.administration.taskManager.task.generic.Context'));
										}
									})
								]
							})
						]
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
