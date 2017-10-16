(function() {
	Ext.define("CMDBuild.controller.management.classes.map.CMMiniCardGridWindowController", {
		mixins: {
			cmMiniCardGridWindowDelegate: "CMDBuild.view.management.common.CMMiniCardGridWindowDelegate",
			cmMiniCardGridDelegate: "CMDBuild.view.management.common.CMMiniCardGridDelegate"
		},

		miniGridWindow: undefined,

		constructor: function() {
			this.dataSource = new CMDBuild.data.CMDetailedCardDataSource();

			this.callParent(arguments);
		},

		bindMiniCardGridWindow: function(miniGridWindow) {
			this.miniGridWindow = miniGridWindow;
			this.miniGridWindow.addDelegate(this);

			this.miniGrid = this.miniGridWindow.getMiniCardGrid();
			this.miniGrid.addDelegate(this);

			this.dataSource.clearStore();
		},

		getDataSource: function() {
			return this.dataSource;
		},

		// * As CMMiniCardGridDelegate ********************/

		miniCardGridItemSelected: function(grid, card) {
			this.miniGridWindow.showDetailsForCard(card);
		},

		miniCardGridWantOpenCard: function(grid, card) {
			CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', card);
			this.miniGridWindow.close();
		},

		// * As CMMiniCardGridWindowDelegate *******************/

		miniCardGridWindowDidShown: function(grid) {}
	});
})();