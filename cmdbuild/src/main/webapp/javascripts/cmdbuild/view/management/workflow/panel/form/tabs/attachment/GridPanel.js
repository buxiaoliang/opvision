(function() {

	/**
	 * Override to customize grid buttons disable action
	 *
	 * @link CMDBuild.view.common.panel.module.attachment.GridPanel
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.attachment.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.configurations.DataFormat',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Attachment'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Grid}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.Modify}
		 */
		buttonActionModify: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.Remove}
		 */
		buttonActionRemove: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.add.Add}
		 */
		buttonAdd: undefined,

		border: false,
		disableSelection: true,
		frame: false,
		scroll: 'vertical', // Business rule: voluntarily hide the horizontal scroll-bar because probably no one want it

		viewConfig: {
			loadMask: true,
			stripeRows: true
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				features: [
					{
						ftype: 'groupingsummary',
						groupHeaderTpl: '{name} ({rows.length} {[values.rows.length > 1 ? CMDBuild.Translation.attachments : CMDBuild.Translation.attachment]})',
						hideGroupedHeader: true
					}
				],
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							this.buttonAdd = Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addAttachment,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onPanelModuleAttachmentGridAddButtonClick');
								}
							})
						]
					})
				],
				columns: [
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.CREATION,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.beginDate,
						sortable: true,
						width: 140
					}),
					Ext.create('Ext.grid.column.Date', {
						dataIndex: CMDBuild.core.constants.Proxy.MODIFICATION,
						format: CMDBuild.core.configurations.DataFormat.getDateTime(),
						text: CMDBuild.Translation.modificationDate,
						sortable: true,
						width: 140
					}),
					{
						dataIndex: CMDBuild.core.constants.Proxy.AUTHOR,
						text: CMDBuild.Translation.author,
						sortable: true,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.VERSION,
						text: CMDBuild.Translation.version,
						sortable: true,
						width: 70
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.FILE_NAME,
						text: CMDBuild.Translation.fileName,
						sortable: true,
						flex: 4
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						sortable: true,
						flex: 6
					},
					Ext.create('Ext.grid.column.Action', {
						align: 'center',
						width: 100,
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
									this.delegate.cmfg('onPanelModuleAttachmentGridDownloadButtonClick', record);
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Versions', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.versions,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelModuleAttachmentGridVersionsButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !record.get(CMDBuild.core.constants.Proxy.VERSIONABLE);
								}
							}),
							this.buttonActionModify = Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.modify,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelModuleAttachmentGridModifyButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !this.delegate.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE);
								}
							}),
							this.buttonActionRemove = Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								withSpacer: true,
								tooltip: CMDBuild.Translation.remove,
								scope: this,

								handler: function (grid, rowIndex, colIndex, node, e, record, rowNode) {
									this.delegate.cmfg('onPanelModuleAttachmentGridRemoveButtonClick', record);
								},

								isDisabled: function (view, rowIndex, colIndex, item, record) {
									return !this.delegate.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE);
								}
							})
						]
					})
				],
				store: CMDBuild.proxy.common.panel.module.attachment.Attachment.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			itemdblclick: function(grid, record, item, index, e, eOpts) {
				this.delegate.cmfg('onPanelModuleAttachmentGridDownloadButtonClick', record);
			}
		}
	});

})();
