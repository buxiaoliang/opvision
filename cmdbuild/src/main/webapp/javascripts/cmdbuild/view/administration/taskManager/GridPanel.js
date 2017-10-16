(function () {

	Ext.define('CMDBuild.view.administration.taskManager.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Grid}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-border-bottom',
		frame: false,
		height: '30%',
		region: 'north',
		split: true,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.ID,
						hidden: true
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.TYPE,
						text: CMDBuild.Translation.type,
						flex: 1,
						scope: this,

						renderer: function (value, meta, record, rowIndex, colIndex, store, view) { // Convert to camelcase
							if (Ext.isArray(value) && !Ext.isEmpty(value)) {
								var translationKey = '';

								Ext.Array.each(value, function (typeSection, i, allTypeSections) {
									if (Ext.isString(typeSection) && !Ext.isEmpty(typeSection))
										if (i > 0) {
											translationKey += CMDBuild.core.Utils.toTitleCase(typeSection);
										} else {
											translationKey += typeSection;
										}
								}, this);

								return CMDBuild.Translation[translationKey];
							}

							return value;
						}
					},
					{
						text: CMDBuild.Translation.descriptionLabel,
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						flex: 4
					},
					Ext.create('Ext.ux.grid.column.Active', {
						dataIndex: CMDBuild.core.constants.Proxy.ACTIVE,
						text: CMDBuild.Translation.active,
						iconAltTextActive: CMDBuild.Translation.running,
						iconAltTextNotActive: CMDBuild.Translation.stopped,
						width: 60,
						align: 'center',
						hideable: false,
						menuDisabled: true,
						fixed: true
					}),
					Ext.create('Ext.grid.column.Action', {
						align: 'center',
						width: 75,
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						items: [
							Ext.create('CMDBuild.core.buttons.taskManager.SingleExecution', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.singleExecution,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return !record.get(CMDBuild.core.constants.Proxy.EXECUTABLE);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onTaskManagerGridSingleExecutionButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.taskManager.CyclicExecution', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.cyclicExecution,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return record.get(CMDBuild.core.constants.Proxy.ACTIVE);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onTaskManagerGridCyclicExecutionButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Stop', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.stop,
								scope: this,

								isDisabled: function (grid, rowIndex, colIndex, item, record) {
									return !record.get(CMDBuild.core.constants.Proxy.ACTIVE);
								},

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onTaskManagerGridStopButtonClick', record);
								}
							})
						]
					})
				]
			});

			this.callParent(arguments);
		},


		listeners: {
			itemdblclick: function (grid, record, item, index, e, eOpts) {
				this.delegate.cmfg('onTaskManagerItemDoubleClick', record);
			},
			select: function (model, record, index, eOpts) {
				this.delegate.cmfg('onTaskManagerRowSelected', record);
			}
		}
	});

})();
