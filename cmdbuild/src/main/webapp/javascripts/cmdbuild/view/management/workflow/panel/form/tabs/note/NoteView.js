(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.Display}
		 */
		displayField: undefined,

		/**
		 * @property {CMDBuild.view.common.field.HtmlEditor}
		 */
		htmlField: undefined,

		/**
		 * @property {Ext.container.Container}
		 */
		panelModeEdit: undefined,

		/**
		 * @property {Ext.container.Container}
		 */
		panelModeRead: undefined,

		bodyCls: 'cmdb-gray-panel-no-padding',
		border: false,
		cls: 'x-panel-body-default-framed',
		frame: false,
		layout: 'card',
		title: CMDBuild.Translation.note,

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
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						}
					})
				],
				items: [
					this.panelModeEdit = Ext.create('Ext.container.Container', {
						border: false,
						frame: false,
						layout: 'fit',

						items: [
							this.htmlField = Ext.create('CMDBuild.view.common.field.HtmlEditor', {
								name: 'Notes',
								border: false,
								hideLabel: true
							})
						]
					}),
					this.panelModeRead = Ext.create('Ext.container.Container', {
						border: false,
						cls: 'x-panel-body-default-framed cmdb-border-bottom',
						frame: false,
						overflowY: 'auto',

						items: [
							this.displayField = Ext.create('Ext.form.field.Display', {
								name: 'Notes',
								padding: '5px'
							})
						]
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function(panel, eOpts) {
				this.delegate.cmfg('onWorkflowFormTabNoteShow');
			}
		}
	});

})();