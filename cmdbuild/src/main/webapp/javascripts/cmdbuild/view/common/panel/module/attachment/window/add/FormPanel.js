(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.add.FormPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Add}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		bodyCls: 'cmdb-blue-panel',
		border: false,
		encoding: 'multipart/form-data',
		fileUpload: true,
		frame: false,
		monitorValid: true,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.containerFieldsCommon = Ext.create('CMDBuild.view.common.panel.module.attachment.window.add.ContainerFieldsCommon', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
