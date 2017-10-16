(function() {
	Ext.define("CMDBuild.controller.management.classes.map.CMMapEditingWindowDelegate", {
		extend : "CMDBuild.view.management.map.CMMapEditingToolsWindowDelegate",
		currentGisShape : undefined,
		constructor : function(master, interactionDocument) {
			this.master = master;
			this.interactionDocument = interactionDocument;
			this.callParent(arguments);
		},

		addFeatureButtonHasBeenToggled : function onAddFeatureButtonToggle() {
			this.interactionDocument.feature.operation = "Draw";
			this.interactionDocument.changedFeature();
		},

		removeFeatureButtonHasBeenClicked : function onRemoveFeatureButtonClick() {
			this.interactionDocument.changedFeature();
		},

		geoAttributeMenuItemHasBeenClicked : function(item) {
			this.interactionDocument.setCurrentFeature(item.name, item.geoType, 'Modify');
			this.interactionDocument.changedFeature();
		}

	});

})();