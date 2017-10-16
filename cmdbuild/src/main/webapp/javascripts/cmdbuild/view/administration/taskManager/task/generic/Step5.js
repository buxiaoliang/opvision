(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.generic.Step5', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Step5}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		reportFieldset: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.reportForm.ReportFormView}
		 */
		reportForm: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.reportFieldset = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.report,
						checkboxName: CMDBuild.core.constants.Proxy.WORKFLOW_ACTIVE,
						checkboxToggle: true,
						collapsed: true,
						collapsible: true,
						toggleOnTitleClick: true,
						overflowY: 'auto',

						items: [
							this.reportForm = Ext.create('CMDBuild.view.administration.taskManager.task.common.reportForm.ReportFormView')
						],

						listeners: {
							scope: this,
							expand: function (field, eOpts) {
								this.reportForm.enable();
							}
						}
					})
				]
			});

			this.reportFieldset.fieldWidthsFix();

			this.callParent(arguments);
		}
	});

})();
