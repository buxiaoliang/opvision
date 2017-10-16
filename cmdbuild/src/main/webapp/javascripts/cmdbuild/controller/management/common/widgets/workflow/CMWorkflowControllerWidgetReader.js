(function() {

	Ext.define("CMDBuild.controller.management.common.widgets.workflow.CMWorkflowControllerWidgetReader",{
		getType: function(w) {return "Activity";},
		getCode: function(w) {return w.workflowName;},
		getPreset: function(w) {return w.preset;},
		getFilter: function(w) {return w.filter;}
	});

})();
