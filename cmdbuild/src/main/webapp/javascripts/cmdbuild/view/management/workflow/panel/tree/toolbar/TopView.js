(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.toolbar.TopView', {
		extend: 'Ext.toolbar.Toolbar',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.proxy.management.workflow.panel.tree.Tree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.toolbar.Top}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		statusCombo: undefined,

		dock: 'top',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,
				items: [
					Ext.create('CMDBuild.core.buttons.iconized.add.Workflow', { // Placeholder
						text: CMDBuild.Translation.start,
						itemId: 'addButton',
						disabled: true
					}),
					this.statusCombo = Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.STATE,
						maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
						valueField: CMDBuild.core.constants.Proxy.VALUE,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						allowBlank: false,
						editable: false,
						forceSelection: true,

						store: CMDBuild.proxy.management.workflow.panel.tree.Tree.getStoreState(),
						queryMode: 'local',

						value: CMDBuild.core.constants.WorkflowStates.getOpen(),

						listeners: {
							scope: this,
							change: function (field, newValue, oldValue, eOpts) {
								this.delegate.cmfg('onWorkflowTreeToolbarTopStateComboChange');
							}
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
