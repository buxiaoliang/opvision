(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditorWindow', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle: CMDBuild.Translation.searchFilter,

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		/**
		 * @property {Ext.tab.Panel}
		 */
		wrapper: undefined,

		border: true,
		closeAction: 'hide',
		frame: true,
		layout: 'fit',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Apply', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowTreeFilterAdvancedFilterEditorApplyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.SaveAndApply', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowTreeFilterAdvancedFilterEditorSaveAndApplyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onWorkflowTreeFilterAdvancedFilterEditorAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.wrapper = Ext.create('Ext.tab.Panel', {
						border: false,
						frame: false
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			hide: function (panel, eOpts) {
				this.delegate.cmfg('onWorkflowTreeFilterAdvancedFilterEditorViewHide');
			},
			show: function (panel, eOpts) {
				this.delegate.cmfg('onWorkflowTreeFilterAdvancedFilterEditorViewShow');
			}
		}
	});

})();
