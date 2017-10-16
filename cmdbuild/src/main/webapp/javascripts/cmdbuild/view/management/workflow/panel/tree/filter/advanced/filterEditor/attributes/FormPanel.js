(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.attributes.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.Attributes}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.split.add.Add}
		 */
		addAttributeButton: undefined,

		bodyCls: 'cmdb-blue-panel',
		border: false,
		frame: false,
		overflowY: 'auto',

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
							this.addAttributeButton = Ext.create('CMDBuild.core.buttons.iconized.split.add.Add', {
								text: CMDBuild.Translation.chooseAnAttribute,
								disabled: true
							})
						]
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
