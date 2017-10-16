(function() {
	CMDBuild.gis = {
		values : {
			browserEnabled : browserEnabled()
		},
		constants : {
			MAP_DIV : 'cmdbBaseBuildMap',
			MAP_OSM : 'osm',
			MAP_YAHOO : 'yahoo',
			MAP_GOOGLE : 'google',
			ENABLED : 'enabled',
			CENTER_LONGITUDE : 'centerLongitude',
			CENTER_LATITUDE : 'centerLatitude',
			ICON_SIZE : .7,
			DEFAULT_SEGMENTS : 10,
			MAX_GRADE_RADIUS : 40,
			MIN_GRADE_RADIUS : 5,
			print : {
				GEOSERVER_PRINT_SERVICE : "pdf/print.pdf",
				GEOSERVER_JSON_SERVICE : "pdf/create.json",
				GEOSERVER_JSON_INFO : "pdf/info.json",
				GEOSERVER_PDF : "pdf",
				GEOSERVER_WORKSPACE_WMS : "wms",
				OSM_SOURCE : "http://a.tile.openstreetmap.org/"

			},
			layers : {
				PUNTUAL_ANALYSIS : "puntual_analysis",
				RANGES_ANALYSIS : "ranges_analysis",
				GRADUATE_ANALYSIS : "graduate_analysis",
				TABLE_SOURCE : "table_source",
				FUNCTION_SOURCE : "function_source",
				DEFAULT_RADIUS : 8,
				ICON_SCALE : 1.5,
				GEO_MIN_ZINDEX : 1000,
				GIS_MIN_ZINDEX : 10000,
				THEMATIC_MIN_ZINDEX : 100000,
				GEOSERVER_LAYER : "_Geoserver",
				THEMATISM_LAYER : "_Thematism"
			},

			shapes : {
				CIRCLE : "shape_circle",
				RECTANGLE : "shape_rectangle",
				STAR : "shape_star"
			},
			metadata : {
				TAGS : "system.entrytype.tags",
				MASTERTABLE : "system.entrytype.mastertable",
				THEMATICFUNCTION : "ThematicFunction"
			},
			colors : {
				POINT_FILL : '#FFCC00',
				POINT_LINE : '#FF9966',
				POLYGON_FILL : 'rgba(0, 0, 255, 0.1)',
				POLYGON_LINE : 'blue',
				LINE_LINE : 'green'
			},
			legend : {
				START_WIDTH : 500,
				START_HEIGHT : 120
			},
			thematic_commands : {
				CHANGE_LAYER : 'CHANGE_LAYER',
				HIDE_LEGEND : 'HIDE_LEGEND',
				HIDE_CURRENT : 'HIDE_CURRENT',
				MODIFY : 'MODIFY',
				NEW : 'NEW',
				PRINT : 'PRINT'
			},
			search_place : {
				NOMINATIM_SERVER : 'http://nominatim.openstreetmap.org/search?format=json&limit=20&q='
			},
			navigation : {
				CARD_WITHOUT_PARENT : "CARD_WITHOUT_PARENT",
				THE_EMPTY_NODE : "EMPTY_NODE",
				LIMIT_SELECTION : 300,
				MAX_VIEW_TREE_NODES : 4000,
				FILTER_FIELD : "_SystemFieldFilter"

			},
			gisLayer : {
				FEATURE_REMOVED : "FEATURE_REMOVED"
			}
		}
	};
	Ext.define('CMDBuild.view.management.classes.map.geoextension.Map', {
		extend : 'Ext.panel.Panel',

		requires : [ 'CMDBuild.core.constants.Proxy', 'CMDBuild.view.management.classes.map.geoextension.Layer',
				'CMDBuild.view.management.classes.map.geoextension.GisLayer' ],
		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.User}
		 */
		delegate : undefined,

		baseTitle : CMDBuild.Translation.users,
		bodyCls : 'cmdb-gray-panel-no-padding',
		region : "center",
		cls : "cmdb-border-right",
		border : false,
		frame : false,
		layout : 'border',
		baseLayer : undefined,
		legendIsOpen : true,

		/**
		 * @property {"CMDBuild.view.management.classes.map.thematism.Legend"}
		 * 
		 */
		legend : undefined,
		configuration : {
			center : undefined,
			zoom : undefined
		},
		constructor : function(options) {
			this.geoExtension = options.geoExtension;
			this.callParent(arguments);
		},

		/**
		 * @returns {Void}
		 * 
		 * @override
		 */
		initComponent : function() {
			this.configure();
			var configuration = this.interactionDocument.getConfigurationMap();
			configuration.center = ol.proj.transform(configuration.center, 'EPSG:4326', 'EPSG:3857');
			this.mapDiv = Ext.create('Ext.container.Container', {
				region : 'center',
				html : "<div id='" + configuration.mapDivId + "'></div>"
			});
			Ext.apply(this, {
				items : [ this.mapDiv ]
			});
			this.geoExtension.setMap(this);
			this.miniCardGridWindowController = Ext
					.create('CMDBuild.controller.management.classes.map.CMMiniCardGridWindowFeaturesController');

			this.callParent(arguments);
		},

		/**
		 * @returns {Void}
		 */
		configure : function() {
		},

		listeners : {
			afterrender : function() {
				var configuration = this.interactionDocument.getConfigurationMap();
				var extent = ol.proj.get("EPSG:900913").getExtent();
				var center = ol.proj.transform(configuration.center, 'EPSG:3857', 'EPSG:4326')
				this.view = new ol.View({
					center : center,
					zoom : configuration.zoom,
					maxZoom : 25,
					minZoom : 2,
					extent : extent

				});
				var template = CMDBuild.Translation.position + ': {x}, {y}';
				var zoomControl = new ol.control.Zoom();
				var me = this;
				var mousePositionControl = new ol.control.MousePosition({
					coordinateFormat : function(coord) {
						var zoom = me.interactionDocument.getZoom();
						return CMDBuild.Translation.zoom + " " + zoom + " " + ol.coordinate.format(coord, template, 2);
					},
					projection : 'EPSG:4326',
					undefinedHTML : '&nbsp;'
				});
				var scaleLineControl = new ol.control.ScaleLine();
				this.map = new ol.Map({
					controls : [ zoomControl, scaleLineControl, mousePositionControl ],
					target : configuration.mapDivId,
					layers : [],
					view : this.view
				});
				me = this;
				this.map.getView().on('propertychange', function(e) {
					switch (e.key) {
					case 'resolution':
						me.refresh();
						me.interactionDocument.changedLayers();
						break;
					}
				});
				this.setLongPress();
				this.createLegend();

			},
			resize : function() {
				var size = [ document.getElementById(this.id + "-body").offsetWidth,
						document.getElementById(this.id + "-body").offsetHeight ];
				this.map.setSize(size);
			},
			show : function(panel, eOpts) {
				this.delegate.cmfg('onUserAndGroupUserShow');
			}
		},
		// interface

		/**
		 * 
		 * @returns {Void}
		 * 
		 */
		clearSelection : function() {
			this.map.getLayers().forEach(function(layer) {
				var adapter = layer.get("adapter");
				if (adapter && adapter.clearSelections) {
					adapter.clearSelections();
				}
			});
		},

		createLegend : function() {
			var divContainerControl = document.createElement('div');
			document.getElementById(this.id + "-body").appendChild(divContainerControl);
			this.legend = Ext.create("CMDBuild.view.management.classes.map.thematism.Legend", {
				parentDiv : divContainerControl,
				interactionDocument : this.interactionDocument,
				thematicView : this.thematicView
			});
			this.legend.compose();
		},
		setOpenLegend : function(value) {
			this.legendIsOpen = value;
		},
		getOpenLegend : function(value) {
			return this.legendIsOpen;
		},
		refreshLegend : function() {
			var arrLayers = this.interactionDocument.getThematicLayers();
			var visibles = [];
			for (var i = 0; i < arrLayers.length; i++) {
				var layer = arrLayers[i];
				var visible = this.interactionDocument.getLayerVisibility(layer);
				if (visible) {
					visibles.push(layer);
				}
			}
			if (visibles.length > 0) {
				this.legend.refreshResults(visibles);
			} else {
				this.legend.hide();
			}
		},

		/**
		 * @param {String}
		 *            name
		 * 
		 * @returns {ol.Layer}
		 * 
		 */
		getLayerByClassAndName : function(className, name) {
			var retLayer = undefined
			var currentCard = this.interactionDocument.getCurrentCard();
			className = (className) ? className : currentCard.className;
			this.map.getLayers().forEach(function(layer) {
				var geoAttribute = layer.get("geoAttribute");
				var masterTableName = (geoAttribute) ? geoAttribute.masterTableName : layer.masterTableName;
				if (layer.get("name") === name && className === masterTableName) {
					retLayer = layer;
				}
			});
			return retLayer;
		},

		/**
		 * @param {Integer}
		 *            cardId
		 * @param {String}
		 *            className
		 * 
		 * @returns {Array} ol.Feature pay attention there is a translation of
		 *          the feature's type (Point -> POINT)
		 * 
		 */
		getGeometries : function(cardId, className) {
			var layers = this.getLayers();
			var geoAttributes = {};
			this.getLayers().forEach(function(layer) {
				var geoAttribute = layer.get("geoAttribute");
				if (geoAttribute && geoAttribute.masterTableName === className) {
					var adapter = layer.get("adapter");
					if (adapter && adapter.getGeometries) {
						var layerName = layer.get("name");
						var geometries = adapter.getGeometries(cardId, className);
						if (geometries === CMDBuild.gis.constants.gisLayer.FEATURE_REMOVED) {
							geoAttributes[layerName] = null;
						}
						else if (geometries) {
							geoAttributes[layerName] = geometries;
						}
					}
				}
			});
			return (Object.getOwnPropertyNames(geoAttributes).length === 0) ? null : geoAttributes;
		},

		/**
		 * @param {String}
		 *            layerName
		 * 
		 * @returns {Void}
		 * 
		 */
		removeLayerByName : function(className, layerName) {
			var layer = this.getLayerByClassAndName(className, layerName);
			if (layer) {
				this.map.removeLayer(layer);
			}
		},

		/**
		 * @param {Object}
		 *            configuration
		 * @param {Array}
		 *            configuration.center
		 * 
		 * @returns {Void}
		 * 
		 */
		center : function(configuration) {
			this.view.setCenter(configuration.center);
			this.map.renderSync();
		},
		resetZoom : function() {
			var configuration = this.interactionDocument.getConfigurationMap();
			var currentCard = this.interactionDocument.getCurrentCard();
			var me = this;
			var isVisible = this.interactionDocument.getVisible();
			var currentZoom = this.getZoom();
			this.interactionDocument.getLayersForCard(currentCard, function(layers) {
				if (layers.length > 0 && layers[0].minZoom >= 0) {
					if (!isVisible) {
						configuration.zoom = layers[0].minZoom;
					} else if (currentZoom < layers[0].minZoom) {
						configuration.zoom = layers[0].minZoom;
					} else {
						configuration.zoom = currentZoom;
					}
				}
				me.view.setZoom(configuration.zoom);
			});
		},
		getZoom : function() {
			return this.view.getZoom();
		},

		/**
		 * 
		 * @returns {ol.Map}
		 * 
		 */
		getMap : function() {
			return this.map;
		},

		/**
		 * 
		 * @returns {Array} ol.Layer
		 * 
		 */
		getLayers : function() {
			return this.map.getLayers();
		},

		/**
		 * @param {ol.Layer}
		 *            layer
		 * @param {Integer}
		 *            index
		 * 
		 * @returns {Void}
		 * 
		 */
		setLayerIndex : function(layer, index) {
			this.map.addLayer(layer);

			this.map.getLayers().insertAt(layer, 0);
		},

		/**
		 * @param {Integer}
		 *            newId
		 * 
		 * @returns {Void}
		 * 
		 */
		changeFeatureOnLayers : function(newId) {
			this.map.getLayers().forEach(function(layer) {
				var adapter = layer.get("adapter");
				if (adapter && adapter.changeFeature)
					adapter.changeFeature(newId);
			});
		},
		/**
		 * @param {Object}
		 *            geoValues
		 * @param {String}
		 *            geoValues.type
		 * @param {String}
		 *            geoValues.name
		 * @param {String}
		 *            geoValues.description
		 * @param {String}
		 *            geoValues.masterTableName // class name
		 * @param {String}
		 *            geoValues.externalGraphic //icon url
		 * @param {Boolean}
		 *            withEditWindow
		 * 
		 * @returns {ol.Layer}
		 * 
		 */
		makeLayer : function(cacheLayer, withEditWindow) {
			var layer;
			var geoValues = cacheLayer.geoAttribute;
			geoValues.minZoom = cacheLayer.minZoom;
			geoValues.maxZoom = cacheLayer.maxZoom;
			if (geoValues.masterTableName === CMDBuild.gis.constants.layers.GEOSERVER_LAYER) {
				layer = Ext.create('CMDBuild.view.management.classes.map.geoextension.Layer', geoValues,
						withEditWindow, this.interactionDocument);
			} else {
				layer = Ext.create('CMDBuild.view.management.classes.map.geoextension.GisLayer', geoValues,
						withEditWindow, this.interactionDocument);

			}
			var geoLayer = layer.getLayer();
			this.map.addLayer(geoLayer);
			return geoLayer;
		},

		/**
		 * @param {Integer}
		 *            newId
		 * 
		 * @returns {Void}
		 * 
		 */
		setLongPress : function() {
			var startPixel = undefined;
			var timeoutId = undefined;
			var map = this.getMap();
			var me = this;

			map.on('pointerdown', function(event) {
				clearTimeout(timeoutId);
				startPixel = map.getEventPixel(event);
				timeoutId = setTimeout(function() {
					me.openMiniCard(event);
				}, 1000, false);
			});
			map.on('pointerup', function(event) {
				clearTimeout(timeoutId);
				startPixel = undefined;
			});
			map.on('pointermove', function(event) {
				if (startPixel) {
					var pixel = map.getEventPixel(event);
					var deltaX = Math.abs(startPixel[0] - pixel[0]);
					var deltaY = Math.abs(startPixel[1] - pixel[1]);
					if (deltaX + deltaY > 6) {
						clearTimeout(timeoutId);
						startPixel = undefined;
					}
				}
			});
		},
		openMiniCard : function(event) {
			if (this.interactionDocument.getEditing()) {
				return;
			}
			var map = this.getMap();
			var me = this;
			var features = [];
			var featureIndex = {};
			map.forEachFeatureAtPixel(event.pixel, function(feature) {
				var properties = feature.getProperties();
				var className = properties.master_className;
				var cardId = properties.master_card;
				if (! featureIndex[className]) {
					featureIndex[className] = {};
				}
				if (! featureIndex[className][cardId]) {
					featureIndex[className][cardId] = true;
					features.push(feature);
				}
			});
			if (features.length === 0) {
				return;
			}
			me.miniCardGridWindowController.setFeatures(features);
			if (me.miniCardGridWindow) {
				me.miniCardGridWindow.close();
			}

			me.miniCardGridWindow = Ext.create('CMDBuild.view.management.common.CMMiniCardGridWindow', {
				width : me.getWidth() / 100 * 40,
				height : me.getHeight() / 100 * 80,
				x : event.pixel.x,
				y : event.pixel.y,
				dataSource : me.miniCardGridWindowController.getDataSource()
			});

			me.miniCardGridWindowController.bindMiniCardGridWindow(me.miniCardGridWindow);
			me.miniCardGridWindow.show();
		}

	});
	function browserEnabled() {
		if (Ext.isIE7) {
			return false;
		}
		if (Ext.isIE8) {
			return false;
		}
		return true;
	}
})();
