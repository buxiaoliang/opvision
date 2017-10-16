(function () {

	/**
	 * Adapter
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.FormPanel', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.panel.form.FormPanel',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel}
		 */
		operativeInstructionsPanel: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.TabPanel}
		 */
		tabPanel: undefined,

		layout: 'border',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.operativeInstructionsPanel = Ext.create('CMDBuild.view.management.workflow.panel.form.OperativeInstructionsPanel', { delegate: this.delegate }),
					this.tabPanel = Ext.create('CMDBuild.view.management.workflow.panel.form.TabPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
