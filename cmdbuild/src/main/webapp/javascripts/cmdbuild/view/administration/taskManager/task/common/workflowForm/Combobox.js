(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.workflowForm.Combobox', {
		extend: 'Ext.form.field.ComboBox',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.common.WorkflowForm'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.WorkflowForm}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 *
		 * @required
		 */
		name: undefined,

		valueField: CMDBuild.core.constants.Proxy.NAME,
		displayField: CMDBuild.core.constants.Proxy.TEXT,
		maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
		forceSelection: true,
		editable: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: CMDBuild.proxy.administration.taskManager.task.common.WorkflowForm.getStore(),
				queryMode: 'local'
			});

			this.callParent(arguments);
		},

		listeners: {
			select: function (combo, records, eOpts) {
				this.delegate.cmOn('onSelectWorkflow', true);
			}
		}
	});

})();
