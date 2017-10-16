(function() {
	Ext.define("CMDBuild.controller.management.classes.map.CMMiniCardGridWindowFeaturesController", {

		extend: "CMDBuild.controller.management.classes.map.CMMiniCardGridWindowController",

		features: [],

		constructor: function() {
			this.callParent(arguments);
		},


		setFeatures: function(features) {
			this.features = features || [];
		},

		// override
		miniCardGridWindowDidShown: function(grid) {
			for (var i=0, f=null; i<this.features.length; ++i) {
				f = this.features[i];
				this.getDataSource().loadCard({
					cardId: f.get("master_card"),
					className: f.get("master_className")
				});
			}
		}
	});
})();