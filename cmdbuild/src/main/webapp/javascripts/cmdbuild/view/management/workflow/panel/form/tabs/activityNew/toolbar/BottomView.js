(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.BottomView', {
		extend: 'CMDBuild.view.common.panel.module.form.toolbar.gridAndForm.BottomView',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Bottom}
		 */
		delegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					Ext.create('CMDBuild.core.buttons.text.Save', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowFormTabActivitySaveButtonClick');
						}
					}),
					Ext.create('CMDBuild.core.buttons.text.Advance', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowFormTabActivityAdvanceButtonClick');
						}
					}),
					Ext.create('CMDBuild.core.buttons.text.Abort', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onWorkflowAbortButtonClick');
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
