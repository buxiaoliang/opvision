(function () {

	Ext.define('CMDBuild.view.management.common.tabs.email.attachments.picker.AttachmentGrid', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.tabs.email.Attachment'
		],

		/**
		 * @cfg {CMDBuild.controller.management.common.tabs.email.attachments.Picker}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-border-top',
		frame: false,
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
						dataIndex: CMDBuild.core.constants.Proxy.FILE_NAME,
						text: CMDBuild.Translation.fileName,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						flex: 1
					}
				],
				selModel: Ext.create('Ext.selection.CheckboxModel', { injectCheckbox: 'first' }),
				store: CMDBuild.proxy.common.tabs.email.Attachment.getStore()
			});

			this.callParent(arguments);
		}
	});

})();
