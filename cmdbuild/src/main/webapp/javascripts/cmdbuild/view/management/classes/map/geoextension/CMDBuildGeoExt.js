(function() {

	Ext.define("CMDBuild.view.management.classes.map.geoextension.CMDBuildGeoExt", {
		extend : 'CMDBuild.controller.common.abstract.Base',
		interactionDocument : undefined,
		baseLayer : undefined,
		scalesTable : undefined,

		constructor : function() {
			if (CMDBuild.gis.values.browserEnabled) {
				this.initBaseLayer();
			}
			this.callParent(arguments);
		},
		setMap : function(mapPanel) {
			this.mapPanel = mapPanel;
		},
		getBaseLayer : function() {
			return this.baseLayer;
		},
		initBaseLayer : function() {
			var baseLayer = undefined;
			if (CMDBuild.configuration.gis.get([ CMDBuild.gis.constants.MAP_OSM, CMDBuild.gis.constants.ENABLED ])) {
				var osm_source = new ol.source.OSM();
				baseLayer = new ol.layer.Tile({
					source : osm_source
				});
			} else if (CMDBuild.configuration.gis.get([ CMDBuild.gis.constants.MAP_GOOGLE,
					CMDBuild.gis.constants.ENABLED ])) {
				var osm_source = new ol.source.OSM();
				baseLayer = new ol.layer.Tile({
					source : osm_source
				});
			} else if (CMDBuild.configuration.gis.get([ CMDBuild.gis.constants.MAP_YAHOO,
					CMDBuild.gis.constants.ENABLED ])) {
				var osm_source = new ol.source.OSM();
				baseLayer = new ol.layer.Tile({
					source : osm_source
				});

			}
			this.baseLayer = baseLayer;
		},
		search : function() {
			var searchWindow = Ext.create("CMDBuild.view.management.classes.map.geoextension.SearchPlaceWindow", {
				frame : false,
				border : false,
				region : "center",
				interactionDocument : this.interactionDocument
			});
			searchWindow.show();
		},
		print : function() {
			this.loadPrintCapabilities(function(capabilities) {
				this.loadStores(capabilities);
				var printWindow = Ext.create("CMDBuild.view.management.classes.map.geoextension.PrintMapWindow", {
					frame : false,
					border : false,
					region : "center",
					layouts : this.layouts,
					printExecutor : this
				});
				printWindow.show();
			}, this);
		},
		printExecute : function(config) {
			this.getGeoLayers2Print(function(nameGeoLayers) {
				this.getGisLayers2Print(function(gisLayers) {
					this.printMap(config, nameGeoLayers, gisLayers);
				}, this);
			}, this);
		},
		getGeoLayers2Print : function(callback, callbackScope) {
			var nameLayers = [];
			var currentCard = this.interactionDocument.getCurrentCard();
			this.interactionDocument.getAllLayers(function(layers) {
				for (var i = 0; i < layers.length; i++) {
					var layer = layers[i];
					var visible = this.interactionDocument.isVisible(layer, currentCard.className, currentCard.cardId);
					var hide = !this.interactionDocument.getLayerVisibility(layer);
					var navigable = this.interactionDocument.isANavigableLayer(layer);
					if (this.interactionDocument.isGeoServerLayer(layer) && !hide && visible && navigable) {
						nameLayers.push(layer.name);
					}
				}
				callback.apply(callbackScope, [ nameLayers ]);
			}, this);
		},
		getGisLayers2Print : function(callback, callbackScope) {
			var currentCard = this.interactionDocument.getCurrentCard();
			var mapPanel = this.interactionDocument.getMapPanel();
			var gisLayers = [];
			this.interactionDocument.getAllLayers(function(layers) {
				for (var i = 0; i < layers.length; i++) {
					var layer = layers[i];
					var visible = this.interactionDocument.isVisible(layer, currentCard.className, currentCard.cardId);
					var hide = !this.interactionDocument.getLayerVisibility(layer);
					var navigable = this.interactionDocument.isANavigableLayer(layer);
					if (!this.interactionDocument.isGeoServerLayer(layer) && !hide && visible && navigable) {
						var olLayer = mapPanel.getLayerByClassAndName(layer.masterTableName, layer.name);
						if (olLayer) {
							gisLayers.push(olLayer);
						}
					}
				}
				callback.apply(callbackScope, [ gisLayers ]);
			}, this);
		},
		getThematicLayer : function() {
			var currentCard = this.interactionDocument.getCurrentCard();
			var currentClassName = currentCard.className;
			var currentThematicLayerName = this.interactionDocument.getCurrentThematicLayer(currentClassName);
			var mapPanel = this.interactionDocument.getMapPanel();
			var mapThematicLayer = mapPanel.getLayerByClassAndName(CMDBuild.gis.constants.layers.THEMATISM_LAYER,
					currentThematicLayerName);
			return mapThematicLayer;
		},
		scaleFromZoom : function() {
			var map = this.interactionDocument.getMap();
			var view = map.getView();
			var resolution = view.getResolution();
			var factor = getScaleForResolution(resolution);
			for (var i = 1; i < this.scalesTable.length; i++) {
				if (this.scalesTable[i].value > factor) {
					return this.scalesTable[i - 1].value;
				}
			}
			return 1000;
		},
		serialize : function(olLayer, callback, callbackScope) {
			if (!olLayer) {
				return null;
			}
			var source = olLayer.getSource();
			var features = (source && source.getFeatures) ? source.getFeatures() : new ol.Collection();
			var styleFunction = ( olLayer.getStyle) ? olLayer.getStyle() : null;
			var me = this;
			var serialized = undefined;
			this.loadLayerFeatures(features, styleFunction, function(geoJsonFeatures, styles) {
				var serialized = undefined;
				if (geoJsonFeatures.length > 0) {
					var geojsonFeatureCollection = {
						type : 'FeatureCollection',
						features : geoJsonFeatures,
						opacity : 1,
						styleProperty : "_gx_style"
					};
					serialized = {
						geoJson : geojsonFeatureCollection,
						type : "Vector",
						opacity : 1,
						styleProperty : "_gx_style",
						name : "vector",
						styles : styles
					}
				} else {
					serialized = this.FALLBACK_SERIALIZATION;
				}
				callback.apply(callbackScope, [ serialized ]);
			}, this);
		},
		getCacheLayerIcon : function(nameAttribute, feature) {
			var cacheLayer = this.interactionDocument.getLayerByName(nameAttribute);
			var icon = cacheLayer.externalGraphic;
			return icon;
		},
		loadLayerFeatures : function(features, styleFunction, callback, callbackScope) {
			var geoJsonFeatures = [];
			var styles = {};
			var me = this;
			var indexStyle = 1;
			Ext.each(features, function(feature) {
				var geometry = feature.getGeometry();
				var format = new ol.format.GeoJSON();
				var style = getStyleFromFeature(feature, styleFunction);
				styles[indexStyle] = style;
				var geometryType = geometry.getType();
				var geojsonFeature = {
					type : "Feature",
					properties : {
						_gx_style : indexStyle
					},
					geometry : {
						type : geometry.getType(),
						coordinates : geometry.getCoordinates()
					}
				};
				indexStyle++;
				geoJsonFeatures.push(geojsonFeature);
			});
			callback.apply(callbackScope, [ geoJsonFeatures, styles ])
		},
		loadGisLayers : function(layers, gisLayers) {
			for (var i = 0; i < gisLayers.length; i++) {
				this.serialize(gisLayers[i], function(jsonLayer) {
					if (jsonLayer !== null) {
						layers.push(jsonLayer);
					}
				}, this);
			}
		},
		loadThematicLayer : function(layer, layers) {
			this.serialize(layer, function(jsonLayer) {
				if (jsonLayer !== null) {
					layers.push(jsonLayer);
				}
			}, this);
		},
		printMap : function(config, nameGeoServerLayers, gisLayers, scale) {
			var scale = this.scaleFromZoom();
			var map = this.interactionDocument.getMap();
			var thematicLayer = this.getThematicLayer();
			var geoserver_url = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'url' ]);
			var url = geoserver_url + '/' + CMDBuild.gis.constants.print.GEOSERVER_JSON_SERVICE;
			var center = map.getView().getCenter();
			var extent = map.getView().calculateExtent(map.getSize());
			var mapLayer = getMapLayer(extent);
			var geoServerLayer = getGeoServerLayers(nameGeoServerLayers);
			var layers = [ mapLayer, geoServerLayer ];
			this.loadGisLayers(layers, gisLayers);
			this.loadThematicLayer(thematicLayer, layers);
			var data = this.loadThematicLegend();
			var basePath = window.location.toString().split('/');
			basePath = Ext.Array.slice(basePath, 0, basePath.length - 1).join('/');
			var logo = basePath + "/images/logo.png";
			var bbox = [ -1050091.8944356, 4675576.582525099, -990623.88643799, 4733515.8499572 ];
			var options = {
				units : 'm',
				srs : 'EPSG:3857',
				layout : config.layout,
				outputFormat : 'pdf',
				dpi : '300',
				mapTitle : config.pageTitle,
				comment : config.comment,
				data : data,
				layers : layers,

				pages : [ {
					bbox : bbox,
					center : center,
					scale : scale,
					mapPage : 1,
					logo : logo,
					data : false
				}, {
					// data : false with false it hide all the 3th page
					data : data,
					thematismName : (thematicLayer) ? thematicLayer.name : "",
					bbox : bbox,
					logo : logo
				} ]
			};
			var me = this;
			Ext.Ajax.request({
				url : url,
				method : "POST",
				jsonData : options,
				success : function(response) {
					var pdfString = response.responseText;
					me.temporaryPdfUrl = Ext.decode(pdfString).getURL;
					var splittedUrl = me.temporaryPdfUrl.split("/");
					me.temporaryPdfUrl = geoserver_url + "/pdf/" + splittedUrl[splittedUrl.length - 1];
					window.open(me.temporaryPdfUrl);
				}
			});
		},
		loadPrintCapabilities : function(callback, callbackScope) {
			var geoserver_url = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'url' ]);
			var url = geoserver_url + '/' + CMDBuild.gis.constants.print.GEOSERVER_JSON_INFO;
			var printConfig = {
				printURL : geoserver_url + "/" + CMDBuild.gis.constants.print.GEOSERVER_PRINT_SERVICE + "iga",
				createURL : geoserver_url + "/" + CMDBuild.gis.constants.print.GEOSERVER_JSON_SERVICE + "iga"
			}
			Ext.Ajax.request({
				url : url,
				params : {
					url : geoserver_url + '/' + CMDBuild.gis.constants.print.GEOSERVER_PDF + "iga"
				},
				method : "GET",
				disableCaching : false,
				success : function(response) {
					var capabilities = Ext.decode(response.responseText);
					callback.apply(callbackScope, [ capabilities ]);
				},
				scope : this
			});
		},
		loadStores : function(capabilities) {
			this.scalesTable = capabilities.scales;
			this.layouts = [];
			for (var i = 0; i < capabilities.layouts.length; i++) {
				this.layouts.push(capabilities.layouts[i].name);
			}
		},
		loadThematicLegend : function() {
			var data = {
				data : [],
				columns : [ 'value', 'cardinality', 'color' ]
			};
			var currentCard = this.interactionDocument.getCurrentCard();
			var currentThematicLayerName = this.interactionDocument.getCurrentThematicLayer(currentCard.className);
			if (!currentThematicLayerName) {
				return false; // false make jump the condition on the
				// config.yaml configuration
			}
			var mapPanel = this.interactionDocument.getMapPanel();
			var mapThematicLayer = mapPanel.getLayerByClassAndName(CMDBuild.gis.constants.layers.THEMATISM_LAYER,
					currentThematicLayerName);
			var thematicAdapter = mapThematicLayer.get("adapter")
			var analysis = thematicAdapter.getThematismAnalysisType();
			var colorsTable = thematicAdapter.getColorsTable();// N.B.
			for (var i = 0; i < colorsTable.length; i++) {
				var color = colorsTable[i];
				var haveColors = (analysis !== CMDBuild.gis.constants.layers.GRADUATE_ANALYSIS);
				var arr = (haveColors) ? getColorValues(color.color) : [ 255, 255, 255 ];
				var hex = rgbToHex(arr[0], arr[1], arr[2]);
				data.data.push({
					value : color.value,
					cardinality : color.cardinality,
					color : hex
				});
			}
			return data;
		}
	});
	function getStyleFromFeature(feature, styleFunction) {
		var style = feature.getStyle();
		if (!style) {
			style = styleFunction(feature);
		}
		if (typeof style === 'function') {
			style = style(feature);
		}
		var basePath = window.location.toString().split('/');
		basePath = Ext.Array.slice(basePath, 0, basePath.length - 1).join('/');
		var fillColor = getColorOrTransparent(style.getFill());
		var strokeColor = getColorOrTransparent(style.getStroke());
		var radius = 12;
		var strokeWidth = 1;
		var image = style.getImage();
		var externalGraphic = (image && image.getSrc) ? basePath + "/" + image.getSrc() : "";
		if (externalGraphic === "" && image) {
			fillColor = getColorOrTransparent(image.getFill());
			strokeColor = getColorOrTransparent(image.getStroke());
			radius = image.getRadius();
		}
		return {
			externalGraphic : externalGraphic,
			fillColor : fillColor,
			strokeColor : strokeColor,
			pointRadius : radius,
			strokeWidth : strokeWidth
		};
	}
	function getColorOrTransparent(stylePrimitive) {
		var TRANSPARENT = [ 0, 0, 0, 0 ];
		var arColor = (stylePrimitive && stylePrimitive.getColor()) ? stylePrimitive.getColor() : TRANSPARENT;
		return rgbArrayToHex(arColor);
	}
	function getMapLayer(extent) {
		return {
			baseURL : CMDBuild.gis.constants.print.OSM_SOURCE,
			singleTile : false,
			type : 'OSM',
			maxExtent : [ -20037508.3392, -20037508.3392, 20037508.3392, 20037508.3392 ],
			tileSize : [ 256, 256 ],
			extension : 'png',
			opacity : 1.0,
			resolutions : [ 156543.0339, 78271.51695, 39135.758475, 19567.8792375, 9783.93961875, 4891.969809375,
					2445.9849046875, 1222.99245234375, 611.496226171875, 305.7481130859375, 152.87405654296876,
					76.43702827148438, 38.21851413574219, 19.109257067871095, 9.554628533935547, 4.777314266967774,
					2.388657133483887, 1.1943285667419434, 0.5971642833709717 ]
		};
	}
	function getGeoServerLayers(nameGeoServerLayers) {
		var geoserver_ws = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'workspace' ]);
		var geoserver_url = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'url' ]);
		var layers = [];
		for (var i = 0; i < nameGeoServerLayers.length; i++) {
			layers.push(geoserver_ws + ":" + nameGeoServerLayers[i]);
		}
		var url = geoserver_url + '/' + CMDBuild.gis.constants.print.GEOSERVER_WORKSPACE_WMS;
		return {
			baseURL : url,
			customParams : {
				TRANSPARENT : true
			},
			format : "image/png",
			layers : layers,
			opacity : 1,
			serverType : "geoserver",
			type : "WMS",
			styles : [ "" ]

		};
	}
	function rgbArrayToHex(rgbArr) {
		if (typeof rgbArr === "string") {
			rgbArr = getColorValues(rgbArr);
		}
		return rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
	}
	function rgbToHex(r, g, b) {
		r = Number(r);
		g = Number(g);
		b = Number(b);
		if (isNaN(r) || r < 0 || r > 255 || isNaN(g) || g < 0 || g > 255 || isNaN(b) || b < 0 || b > 255) {
			r = g = b = 0;
		}

		var hexR = padHexValue(r.toString(16));
		var hexG = padHexValue(g.toString(16));
		var hexB = padHexValue(b.toString(16));
		return '#' + hexR + hexG + hexB;
	}
	function padHexValue(hex) {
		return hex.length === 1 ? '0' + hex : hex;
	}
	function getColorValues(color) {
		var values = {
			red : null,
			green : null,
			blue : null,
			alpha : null
		};
		if (typeof color == 'string') {
			/* hex */
			if (color.indexOf('#') === 0) {
				color = color.substr(1)
				if (color.length == 3)
					values = [ parseInt(color[0] + color[0], 16), parseInt(color[1] + color[1], 16),
							parseInt(color[2] + color[2], 16), 1 ];
				else
					values = [ parseInt(color.substr(0, 2), 16), parseInt(color.substr(2, 2), 16),
							parseInt(color.substr(4, 2), 16), 1 ];
				/* rgb */
			} else if (color.indexOf('rgb(') === 0) {
				var pars = color.indexOf(',');
				values = [ parseInt(color.substr(4, pars)), parseInt(color.substr(pars + 1, color.indexOf(',', pars))),
						parseInt(color.substr(color.indexOf(',', pars + 1) + 1, color.indexOf(')'))), 1 ];
				/* rgba */
			} else if (color.indexOf('rgba(') === 0) {
				var pars = color.indexOf(','), repars = color.indexOf(',', pars + 1);
				values = [ parseInt(color.substr(5, pars)), parseInt(color.substr(pars + 1, repars)),
						parseInt(color.substr(color.indexOf(',', pars + 1) + 1, color.indexOf(',', repars))),
						parseFloat(color.substr(color.indexOf(',', repars + 1) + 1, color.indexOf(')'))) ];
				/* verbous */
			} else {
				var stdCol = {
					acqua : '#0ff',
					teal : '#008080',
					blue : '#00f',
					navy : '#000080',
					yellow : '#ff0',
					olive : '#808000',
					lime : '#0f0',
					green : '#008000',
					fuchsia : '#f0f',
					purple : '#800080',
					red : '#f00',
					maroon : '#800000',
					white : '#fff',
					gray : '#808080',
					silver : '#c0c0c0',
					black : '#000'
				};
				if (stdCol[color] != undefined)
					values = getColorValues(stdCol[color]);
			}
		}
		return values
	}
	function getScaleForResolution(resolution) {
		var dpi = 25.4 / 0.28;
		var mpu = 1;
		var inchesPerMeter = 39.37;
		return resolution * (mpu * inchesPerMeter * dpi);
	}
})();
