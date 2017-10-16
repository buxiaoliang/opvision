(function() {

	Ext.define('CMDBuild.view.management.classes.map.thematism.Legend', {
		extends : [ Ext.Object ],
		parentDiv : undefined,
		interactionDocument : undefined,
		thematicView : undefined,
		constructor : function(parameters) {
			this.interactionDocument = parameters.interactionDocument;
			this.parentDiv = parameters.parentDiv;
			this.thematicView = parameters.thematicView;

			var div = "<div id='CMDBUILD_THEMATHICLEGEND' style='position: absolute;'></div>";
			this.parentDiv.innerHTML = div;
		},
		compose : function() {
			this.grid = Ext.create("CMDBuild.view.management.classes.map.thematism.LegendPanel", {
				renderTo : "CMDBUILD_THEMATHICLEGEND",
				value : 100,
				listeners : {},
				interactionDocument : this.interactionDocument,
				thematicView : this.thematicView

			});
		},
		hide : function() {
			this.grid.hide();
		},
		show : function() {
			this.grid.show();
		}

	});
	Ext.define("CMDBuild.view.management.classes.map.thematism.LegendPanel", {
		extend : "Ext.panel.Panel",
		width : CMDBuild.gis.constants.legend.START_WIDTH,
		height : CMDBuild.gis.constants.legend.START_HEIGHT,
		layout : 'fit',
		resizable : true,
		initComponent : function() {
			var me = this;
			// this panel only for have scroolbars on the Grid
			this.createControls();
			Ext.apply(this, {
				items : [ this.grid ],
				hidden : true
			});
			this.interactionDocument.observeThematicDocument(this);
			this.callParent(arguments);
		},
		createControls : function() {
			var me = this;
			var layersStore = Ext.create('Ext.data.Store', {
				fields : [ 'name' ],
				data : []
			});
			this.colorsStore = Ext.create("Ext.data.Store", {
				fields : [ "value", "cardinality", "color" ],
				data : []
			});
			var colorPicker = Ext.create('CMDBuild.view.common.field.picker.Color');
			this.grid = Ext.create("Ext.grid.Panel", {
				title : "Results",
				store : this.colorsStore,
				width : "100%",
				height : "100%",
				plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1
				}) ],
				columns : [ {
					text : CMDBuild.Translation.value,
					dataIndex : "value",
					flex : 1
				}, {
					text : "Cardinality",
					dataIndex : "cardinality"
				}, {
					text : CMDBuild.Translation.thematicColor,
					dataIndex : "color",
					disabled : true,
					renderer : function(value, metaData) {
						metaData.style = "background-color:" + value + ";font-size:" + 0;
						return value;
					}
				} ],
				height : "100%",
				width : "100%"
			});
		},
		chargeStore : function(cardsStore, colorsTable) {
			for (var i = 0; i < colorsTable.length; i++) {
				cardsStore.add({
					value : colorsTable[i].value,
					cardinality : colorsTable[i].cardinality,
					color : colorsTable[i].color
				});
			}
		},
		getCurrentThematicLayer : function(className) {
			var currentThematicLayerName = this.interactionDocument.getCurrentThematicLayer(className);
			return currentThematicLayerName
		},
		refresh : function() {
			this.isLoading = true;
			var currentLayersStore = Ext.create("Ext.data.Store", {
				fields : [ "name" ],
				autoLoad : false,
				data : []
			});
			var currentCard = this.interactionDocument.getCurrentCard();
			var currentThematicLayerName = this.getCurrentThematicLayer(currentCard.className);
			var mapPanel = this.interactionDocument.getMapPanel();
			var mapThematicLayer = mapPanel.getLayerByClassAndName(currentCard.className, currentThematicLayerName);
			if (!mapThematicLayer) {
				mapThematicLayer = mapPanel.refreshThematicLayer(currentCard.className, currentCard.cardId);
			}
			if (mapThematicLayer === null) {
				mapPanel.removeThematicsNotVisibleLayers(currentThematicLayerName);
				this.hide();
				return;
			}
			var currentResultsStore = Ext.create("Ext.data.Store", {
				fields : [ "value", "cardinality", "color" ],
				autoLoad : false,
				data : []
			});
			var colorsTable = mapThematicLayer.get("adapter").getColorsTable();// N.B.
			this.chargeStore(currentResultsStore, colorsTable);
			this.grid.getStore().loadData(currentResultsStore.getRange(), false);
			this.isLoading = false;
			if (mapPanel.getOpenLegend()) {
				this.show();
			}
		}
	});

})();