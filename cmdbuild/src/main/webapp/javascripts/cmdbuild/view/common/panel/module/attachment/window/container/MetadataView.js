(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.container.MetadataView', {
		extend: 'Ext.form.FieldContainer',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.container.Metadata}
		 */
		delegate: undefined,

		border: false,
		considerAsFieldToDisable: true,
		frame: false,
		hidden: true,
		hideLabel: true,
		name: CMDBuild.core.constants.Proxy.META,

		layout: {
			type: 'vbox',
			align: 'stretch'
		}
	});

})();
