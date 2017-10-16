(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.TopView', {
		extend: 'CMDBuild.view.common.panel.module.form.toolbar.TopView',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Top}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.toolbar.TextItem}
		 */
		activityDescription: undefined,

		/**
		 * @property {Ext.toolbar.TextItem}
		 */
		activityPerformerName: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.Remove}
		 */
		buttonRemove: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					Ext.create('CMDBuild.core.buttons.iconized.Modify', {
						text: CMDBuild.Translation.modifyActivity,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowModifyButtonClick');
						}
					}),
					this.buttonRemove = Ext.create('CMDBuild.core.buttons.iconized.Remove', {
						text: CMDBuild.Translation.abortProcess,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowRemoveButtonClick');
						}
					}),
					CMDBuild.configuration.graph.get(CMDBuild.core.constants.Proxy.ENABLED) ? Ext.create('CMDBuild.core.buttons.iconized.RelationGraph', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowGraphButtonClick');
						}
					}): null,
					'->',
					'-',
					this.activityPerformerName = Ext.create('Ext.toolbar.TextItem'),
					'-',
					this.activityDescription = Ext.create('Ext.toolbar.TextItem')
				]
			});

			this.callParent(arguments);
		}
	});

})();
