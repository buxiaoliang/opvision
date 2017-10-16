(function() {

	var queryWorkflowStore = Ext.create('Ext.data.Store', {
		fields: ['Code', 'Description'],
		data : []
	});

	Ext.define("CMDBuild.view.management.common.widgets.workflow.CMWorkflowCombo", {
		extend: "Ext.panel.Panel",
		panel: undefined,
		bodyCls: "x-panel-body-default-framed",
		frame : true,
		border: true,
		initComponent: function() {
			this.queryWorkflow = Ext.create('Ext.form.ComboBox', {
			    fieldLabel: CMDBuild.Translation.workflow,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				width: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
				labelAlign: "right",
			    store: queryWorkflowStore,
			    queryMode: 'local',
			    displayField: 'Description',
			    valueField: 'Code',
			    autoSelect: true,
			    listeners:{
			         scope: this.panel,
			         'select': function(item, param) {
			        	 this.delegate.changeWorkflow(param[0].get("Code"));
			         }
			    }
			});
			this.items = [this.queryWorkflow];
			this.callParent(arguments);
		},
		clearComboValues: function() {
			queryWorkflowStore.removeAll(true);
		},
		loadComboValues: function(data) {
			queryWorkflowStore.loadRawData(data);
		},
		clearCombo: function() {
			this.queryWorkflow.setValue("");
		}
	});

})();
