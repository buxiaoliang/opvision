(function() {

	Ext.define('CMDBuild.view.common.panel.module.attachment.versions.GridPanel', {
		extend: 'Ext.grid.Panel',

		uses: [
			'CMDBuild.core.configurations.DataFormat',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Versions'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Versions}
		 */
		delegate: undefined,

		border: false,
		disableSelection: true,
		frame: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it

		viewConfig: {
			loadMask: true,
			stripeRows: true,
			getRowClass: function (record) {
				return record.index == 0 ? 'x-grid-row-bold' : '';
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.CREATION,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.beginDate,
						sortable: false,
						width: 140
					}),
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.MODIFICATION,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.modificationDate,
						sortable: false,
						width: 140
					}),
					{
						dataIndex: CMDBuild.core.constants.Proxy.AUTHOR,
						text: CMDBuild.Translation.author,
						sortable: false,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.VERSION,
						text: CMDBuild.Translation.version,
						sortable: false,
						width: 70
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.FILE_NAME,
						text: CMDBuild.Translation.fileName,
						sortable: false,
						flex: 4
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						sortable: false,
						flex: 6
					},
					Ext.create('Ext.grid.column.Action', {
						align: 'center',
						width: 30,
						sortable: false,
						hideable: false,
						menuDisabled: true,
						fixed: true,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.Download', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.download,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelModuleAttachmentVersionsDownloadButtonClick', record);
								}
							})
						]
					})
				],
				store: CMDBuild.proxy.common.panel.module.attachment.Versions.getStore()
			});

			this.callParent(arguments);
		}
	});

})();
