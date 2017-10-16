(function () {

	/**
	 * @link CMDBuild.view.administration.workflow.tabs.properties.FormPanel
	 */
	Ext.define('CMDBuild.view.administration.classes.tabs.properties.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.Properties}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.IconsPanel}
		 */
		panelIcons: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.BasePropertiesPanel}
		 */
		panelProperties: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		frame: false,
		overflowY: 'auto',
		split: true,

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								text: CMDBuild.Translation.modifyClass,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabPropertiesModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeClass,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabPropertiesRemoveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.split.Print', {
								delegate: this.delegate,
								text: CMDBuild.Translation.printClass,
								delegateEventPrefix: 'onClassesTabProperties',
								formatList: [
									CMDBuild.core.constants.Proxy.PDF,
									CMDBuild.core.constants.Proxy.ODT
								]
							})
						]
					})
				],
				items: [
					Ext.create('Ext.form.FieldSet', {
						layout: 'fit',
						title: CMDBuild.Translation.baseProperties,

						items: [
							this.panelProperties = Ext.create('CMDBuild.view.administration.classes.tabs.properties.panel.BasePropertiesPanel', { delegate: this.delegate })
						]
					}),
					Ext.create('Ext.form.FieldSet', {
						layout: 'fit',
						title: CMDBuild.Translation.icon,

						items: [
							this.panelIcons = Ext.create('CMDBuild.view.administration.classes.tabs.properties.panel.IconsPanel', { delegate: this.delegate })
						]
					})
				]
			});

			this.callParent(arguments);

			this.setDisabledModify(true, true, true);
		}
	});

})();
