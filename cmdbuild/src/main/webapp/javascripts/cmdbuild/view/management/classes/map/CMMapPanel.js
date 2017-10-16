(function() {

	Ext.define("CMDBuild.view.management.map.CMMapPanelDelegate", {
		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel}
		 *            mapPanel The map panel which has added the layer
		 * @param {Object}
		 *            params Information about the layer
		 * @param {OpenLayers.Map}
		 *            params.object The OpenLayer map which has added the layer
		 * @param {OpenLayers.Layer}
		 *            params.layer The OpenLayer layer which is added
		 */
		onLayerAdded : Ext.emptyFn,

		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel}
		 *            mapPanel The map panel which has removed the layer
		 * @param {Object}
		 *            params Information about the layer
		 * @param {OpenLayers.Map}
		 *            params.object The OpenLayer map which has removed the
		 *            layer
		 * @param {OpenLayers.Layer}
		 *            params.layer The OpenLayer layer which is removed
		 */
		onLayerRemoved : Ext.emptyFn,

		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel}
		 *            mapPanel The map panel which has removed the layer
		 * @param {Object}
		 *            params Information about the layer
		 * @param {OpenLayers.Layer}
		 *            params.layer The OpenLayer layer which is removed
		 * @param {OpenLayers.Layer}
		 *            params.property The layer property that is changed, one of
		 *            [name, order, opacity, params, visibility or attribution]
		 */
		onLayerChanged : Ext.emptyFn,

		/**
		 * 
		 * @param {CMDBuild.view.management.map.CMMapPanel}
		 *            mapPanel The map panel which has removed the layer
		 * @param {boolean}
		 *            visible If the map is now visible or not
		 */
		onMapPanelVisibilityChanged : Ext.emptyFn
	});

	Ext.define("CMDBuild.view.management.classes.map.CMMapPanel", {
		alternateClassName : 'CMDBuild.Management.MapPanel', // Legacy
		// class
		// name
		extend : "Ext.panel.Panel",
		requires : [ 'CMDBuild.controller.management.classes.map.CardGrid',
				'CMDBuild.controller.management.classes.map.LayerTree',
				'CMDBuild.view.management.classes.map.navigationTree.ViewTree',
				'CMDBuild.controller.management.classes.map.thematism.ThematismMainWindow',
				'CMDBuild.view.management.classes.map.thematism.ThematicDocument',
				'CMDBuild.view.management.classes.map.thematism.ThematicStrategiesManager',
				'CMDBuild.view.management.classes.map.geoextension.CMDBuildGeoExt',
				'CMDBuild.view.management.classes.map.thematism.ThematicColors' ],

		mixins : {
			delegable : "CMDBuild.core.CMDelegable"
		},

		lon : undefined,
		lat : undefined,
		initialZoomLevel : undefined,

		layout : 'border',

		/**
		 * CMDBuild.core.buttons.gis.Thematism
		 */
		thematismButton : undefined,

		/**
		 * CMDBuild.core.buttons.gis.PrintMap
		 */
		printMapButton : undefined,

		/**
		 * CMDBuild.core.buttons.gis.SearchPlace
		 */
		searchMapButton : undefined,

		/**
		 * CMDBuild.view.management.classes.map.geoextension.InteractionDocument
		 */
		interactionDocument : undefined,

		/**
		 * CMDBuild.view.management.classes.map.geoextension.CMDBuildGeoExt
		 */
		geoExtension : undefined,

		constructor : function() {
			this.mixins.delegable.constructor.call(this, "CMDBuild.view.management.map.CMMapPanelDelegate");

			this.callParent(arguments);

			this.hideMode = "offsets";
			this.cmAlreadyDisplayed = false;
			this.cmVisible = false;
		},

		initComponent : function() {
			if (!CMDBuild.gis.values.browserEnabled) {
				this.callParent(arguments);
				return;
			}
			var me = this;
			this.geoExtension = Ext.create('CMDBuild.view.management.classes.map.geoextension.CMDBuildGeoExt');
			var thematicDocument = Ext.create('CMDBuild.view.management.classes.map.thematism.ThematicDocument');
			var strategiesManager = Ext
					.create('CMDBuild.view.management.classes.map.thematism.ThematicStrategiesManager');
			thematicDocument.configureStrategiesManager(strategiesManager);
			thematicDocument.setThematismButton(this.thematismButton);
			this.interactionDocument = Ext
					.create('CMDBuild.view.management.classes.map.geoextension.InteractionDocument');
			this.geoExtension.interactionDocument = this.interactionDocument;
			this.thematismButton.interactionDocument = this.interactionDocument;
			var thematicColors = Ext.create('CMDBuild.view.management.classes.map.thematism.ThematicColors');
			thematicDocument.init(this.interactionDocument, thematicColors)
			this.interactionDocument.setThematicDocument(thematicDocument);
			this.thematicView = Ext.create('CMDBuild.controller.management.classes.map.thematism.ThematismMainWindow',
					{
						interactionDocument : this.interactionDocument
					});
			this.mapPanel = Ext.create('CMDBuild.Management.CMMap', {
				geoExtension : this.geoExtension,
				interactionDocument : this.interactionDocument,
				thematicView : this.thematicView
			});
			// _CMMap = this.mapPanel; can be forget?

			var tabs = [];

			if (CMDBuild.configuration.gis.get('cardBrowserByDomainConfiguration')['root']) {
				var root = CMDBuild.configuration.gis.get('cardBrowserByDomainConfiguration')['root'];
				this.interactionDocument.setStarted(false);
				this.cardBrowser = new CMDBuild.view.management.classes.map.navigationTree.ViewTree({
					title : CMDBuild.Translation.management.modcard.gis.gisNavigation,
					frame : false,
					border : false,
					rootText : root.classDescription || root.className,
					interactionDocument : this.interactionDocument
				});
				this.interactionDocument.setNavigationTree(this.cardBrowser)
				tabs.push(this.cardBrowser);

			}
			this.editingWindow = new CMDBuild.view.management.map.CMMapEditingToolsWindow({
				owner : this,
				interactionDocument : this.interactionDocument
			});

			this.layerGridController = new CMDBuild.controller.management.classes.map.LayerTree({
				title : CMDBuild.Translation.administration.modClass.layers,
				interactionDocument : this.interactionDocument
			});
			tabs.push(this.layerGridController.getView());

			this.cardGridController = new CMDBuild.controller.management.classes.map.CardGrid({
				title : CMDBuild.Translation.management.modcard.title,
				interactionDocument : this.interactionDocument,
				parentDelegate : this.delegate,
				mainGrid : this.mainGrid
			});
			tabs.push(this.cardGridController.getView());

			this.layout = "border";
			this.items = [ this.mapPanel, {
				xtype : "tabpanel",
				region : "east",
				cls : "cmdb-border-left",
				width : "25%",
				split : true,
				collapsible : true,
				collapseMode : 'mini',
				header : false,
				frame : false,
				border : false,
				plain : true,
				activeItem : 0,
				padding : "2 0 0 0",
				items : tabs
			} ];

			this.callParent(arguments);
		},
		print : function(command, data) {
			this.geoExtension.print();
		},
		search : function(command, data) {
			this.geoExtension.search();
		},
		executeThematism : function(command, data) {
			var currentCard = this.interactionDocument.getCurrentCard();
			var className = currentCard.className;
			switch (command) {
			case CMDBuild.gis.constants.thematic_commands.NEW:
				this.thematicView.show();
				break;
			case CMDBuild.gis.constants.thematic_commands.MODIFY:
				var currentLayerName = this.interactionDocument.getCurrentThematicLayer(className);
				this.thematicView.show(currentLayerName);
				break;
			case CMDBuild.gis.constants.thematic_commands.HIDE_CURRENT:
				this.interactionDocument.setCursorActive(!data.checked);
				this.interactionDocument.changed();
				break;
			case CMDBuild.gis.constants.thematic_commands.HIDE_LEGEND:
				var mapPanel = this.interactionDocument.getMapPanel();
				if (data.checked) {
					mapPanel.legend.hide();
				} else {
					mapPanel.legend.show();
				}
				break;
			case CMDBuild.gis.constants.thematic_commands.CHANGE_LAYER:
				this.interactionDocument.setCurrentThematicLayer(className, data.text);
				this.interactionDocument.changedThematicDocument();
				break;
			}
		},
		updateSize : function() {
		},
		getMap : function() {
			return this.mapPanel;
		},
		setCmVisible : function(visible) {
			this.cmVisible = visible;
			this.callDelegates("onMapPanelVisibilityChanged", [ this, visible ]);
		},

		editMode : function() {
			if (this.editingWindow) {
				this.editingWindow.show();
			}
		},

		displayMode : function() {
			if (this.editingWindow) {
				this.editingWindow.closeAllEditings();
				this.editingWindow.hide();
				this.interactionDocument.setCurrentFeature("", "", "Select");
				this.interactionDocument.changedFeature();
			}
		},

		getGeoServerLayerByName : function() {
			this.mapPanel.getGeoServerLayerByName(name);
		},
		updateMap : function(entryType) {
			this.editingWindow.removeAllLayerBinding();
		},

		addLayerToEditingWindow : function(layer) {
			this.editingWindow.addLayer(layer);
		},

		getCardBrowserPanel : function() {
			return this.cardBrowser;
		},

		getCardGridController : function() {
			return this.cardGridController;
		}
	});

})();
