(function() {
	Ext
			.define(
					'CMDBuild.Management.CMMap',
					{
						extend : 'CMDBuild.view.management.classes.map.geoextension.Map',
						requires : [ 'CMDBuild.view.management.classes.map.geoextension.Map',
								'CMDBuild.view.management.classes.map.proxy.Icon' ],

						geoExtension : undefined,
						interactionDocument : undefined,
						thematicView : undefined,

						iconCache : {},

						/**
						 * @returns {Void}
						 * 
						 * @override
						 */
						configure : function() {
							this.interactionDocument.setConfigurationMap(this);
							this.interactionDocument.observe(this);
							this.current = this.makePointSelect();
							this.current.setActive(false);
						},
						baseLayer : false,
						/**
						 * @returns {Void}
						 * 
						 * @override
						 */
						refresh : function() {
							// when the refresh is called more times it takes
							// the last
							var me = this;
							if (this.interactionDocument.getEditing() || !this.interactionDocument.getStarted()
									|| !this.interactionDocument.getVisible()) {
								return;
							}
							if (this.operation) {
								clearTimeout(this.operation);
							}
							this.operation = setTimeout(function() {
								me._refresh();
								me.operation = undefined;
							}, 200);
						},
						/**
						 * @returns {Void}
						 * 
						 * @override
						 */
						_refresh : function() {
							if (this.baseLayer === false) {
								this.map.addLayer(this.geoExtension.getBaseLayer());
								this.baseLayer = true;
							}

							var card = this.interactionDocument.getCurrentCard();
							if (!card) {
								return;
							}
							var currentClassName = card.className;
							var currentCardId = card.cardId;
							this.interactionDocument.getAllLayers(function(layers) {
								this.completeStyle(layers, 0, function() {
									this.clearSelections();
									this.refreshAllLayers(layers, currentClassName, currentCardId);
									this.refreshThematicLayer(currentClassName, currentCardId);
									if (this.interactionDocument.getCursorActive()) {
										this.selectCard({
											cardId : currentCardId,
											className : currentClassName
										});
										this.showCurrent(card);
									}
								}, this);
							}, this);
						},
						removeAllLayers : function() {
							var gisLayers = this.interactionDocument.getGisAdapters();
							for ( var key in gisLayers) {
								var namedAdapters = gisLayers[key];
								for (var i = 0; i < namedAdapters.length; i++) {
									namedAdapters[i].adapter.closeAllEditings();
								}
							}
							var mapLayers = this.map.getLayers();
							if (mapLayers.getLength() > 0) {
								mapLayers.clear();
								this.baseLayer = false;
							}
						},

						completeSingleLayerStyle : function(layer, callback, callbackScope) {
							var style = Ext.decode(layer.style);
							var geoAttribute = {
								description : layer.description,
								masterTableName : layer.masterTableName,
								name : layer.name,
								type : layer.type,
								style : style,
								iconSize : layer.iconSize
							};
							layer.geoAttribute = geoAttribute;
							if (!style.externalGraphic) {
								geoAttribute.iconSize = [ 0, 0 ];
								callback.apply(callbackScope, []);
								return;
							}
							if (this.iconCache[style.externalGraphic]) {
								var iconSize = this.iconCache[style.externalGraphic];
								geoAttribute.iconSize = iconSize;
								callback.apply(callbackScope, []);
								return;
							}
							var icon = CMDBuild.view.management.classes.map.proxy.Icon.readIcon(style.externalGraphic,
									function(iconSize, icon) {
										this.iconCache[style.externalGraphic] = iconSize;
										geoAttribute.iconSize = iconSize;
										callback.apply(callbackScope, []);
									}, this);

						},
						completeStyle : function(layers, index, callback, callbackScope) {
							if (index >= layers.length) {
								callback.apply(callbackScope, []);
								return;
							}
							var layer = layers[index++];
							this.completeSingleLayerStyle(layer, function() {
								this.completeStyle(layers, index, callback, callbackScope);
							}, this);
						},

						/**
						 * @param {String}
						 *            currentClassName
						 * @param {Integer}
						 *            currentCardId
						 * 
						 * @returns {Void}
						 */
						refreshThematicLayer : function(currentClassName, currentCardId) {
							var currentThematicLayerName = this.interactionDocument
									.getCurrentThematicLayer(currentClassName);
							this.removeThematicsNotVisibleLayers(currentThematicLayerName);
							if (this.interactionDocument.getThematismActive() === false) {
								return null;
							}
							var thematicLayers = this.interactionDocument.getThematicLayers();
							if (!currentThematicLayerName) {
								return null;
							}
							var mapThematicLayer = this.getLayerByClassAndName(
									CMDBuild.gis.constants.layers.THEMATISM_LAYER, currentThematicLayerName);
							if (!mapThematicLayer) {
								for (var i = 0; i < thematicLayers.length; i++) {
									var layer = thematicLayers[i];
									if (layer.name === currentThematicLayerName) {
										this.map.addLayer(layer);
										mapThematicLayer = layer;
										break;
									}
								}
							}
							if (!mapThematicLayer) {
								return null;
							}
							mapThematicLayer.setZIndex(CMDBuild.gis.constants.layers.THEMATIC_MIN_ZINDEX/* + i */);
							var adapter = mapThematicLayer.get("adapter");
							if (adapter && adapter.refresh) {
								var thematism = adapter.getThematism();
								var originalLayer = thematism.configuration.originalLayer;
								var className = originalLayer.className;
								var name = originalLayer.name;
								thematism.layer = this.getLayerByClassAndName(className, name);
								adapter.refresh({
									cardId : currentCardId,
									className : currentClassName
								});
							}
							return mapThematicLayer;
						},

						/**
						 * @param {Array} :
						 *            layer layers from _CMCACHE
						 * @param {Array} :
						 *            layer.visibility
						 * @param {Array} :
						 *            layer.cardBinding
						 * @param {Integer} :
						 *            layer.maxZoom
						 * @param {Integer} :
						 *            layer.minZoom
						 * @param {String} :
						 *            layer.name
						 * @param {String} :
						 *            layer.description
						 * @param {String} :
						 *            layer.masterTableName // className
						 * 
						 * @param {String}
						 *            currentClassName
						 * @param {Integer}
						 *            currentCardId
						 * 
						 * @returns {Void}
						 */
						refreshAllLayers : function(layers, currentClassName, currentCardId) {
							var visibleLayers = [];
							this.refreshAllLayersRecursive(layers, 0, visibleLayers, currentClassName, currentCardId,
									function() {
										this.removeNotVisibleLayers(layers, visibleLayers);
									}, this);
						},
						refreshAllLayersRecursive : function(layers, index, visibleLayers, currentClassName,
								currentCardId, callback, callbackScope) {
							if (index >= layers.length) {
								callback.apply(callbackScope, []);
								return;
							}
							var layer = layers[index];
							index++;
							var zoom = this.interactionDocument.getZoom();
							if (zoom < layer.minZoom || zoom > layer.maxZoom) {
								this.clearHideLayer(layer.masterTableName, layer.name);
								this.refreshAllLayersRecursive(layers, index, visibleLayers, currentClassName,
										currentCardId, callback, callbackScope);
							} else {
								this.refreshSingleLayer(layer, visibleLayers, currentClassName, currentCardId,
										function() {
											this.refreshAllLayersRecursive(layers, index, visibleLayers,
													currentClassName, currentCardId, callback, callbackScope);
										}, this);
							}
						},
						refreshSingleLayer : function(layer, visibleLayers, currentClassName, currentCardId, callback,
								callbackScope) {
							var visible = this.interactionDocument.isVisible(layer, currentClassName, currentCardId);
							var hide = !this.interactionDocument.getLayerVisibility(layer);
							var navigable = this.interactionDocument.isANavigableLayer(layer);
							if (this.interactionDocument.isGeoServerLayer(layer)
									&& !this.interactionDocument.isGeoServerEnabled()) {
								this.clearHideLayer(layer.masterTableName, layer.name);
							} else {
								if ((hide || !navigable) && visible) {
									this.clearHideLayer(layer.masterTableName, layer.name);
								} else if (visible && navigable) {
									this.showLayer(layer, currentClassName, currentCardId);
									visibleLayers.push(layer);
								}
							}
							callback.apply(callbackScope, []);
						},
						selectCard : function(card) {
							var geoLayers = this.getLayers();
							geoLayers.forEach(function(olLayer) {
								var adapter = olLayer.get("adapter");
								if (adapter && adapter.selectCard) {
									adapter.selectCard(card);
								}
							});
						},
						showLayer : function(layer, currentClassName, currentCardId) {
							var olLayer = this.getLayerByClassAndName(layer.masterTableName, layer.name);
							if (!olLayer) {
								olLayer = this.makeLayer(layer, true);
							}
							olLayer.set("cmdbuildLayer", layer);
							var index = CMDBuild.gis.constants.layers.GIS_MIN_ZINDEX + layer.index;
							if (layer.geoAttribute.masterTableName === CMDBuild.gis.constants.layers.GEOSERVER_LAYER) {
								index = CMDBuild.gis.constants.layers.GEO_MIN_ZINDEX;
							}
							olLayer.setZIndex(index);
							var adapter = olLayer.get("adapter");
							if (adapter && adapter.refresh) {
								adapter.refresh();
							}

						},
						clearHideLayer : function(className, nameLayer) {
							var olLayer = this.getLayerByClassAndName(className, nameLayer);
							if (olLayer) {
								var adapter = olLayer.get("adapter");
								if (adapter && adapter.clearAllFeatures) {
									adapter.clearAllFeatures();
								}
								this.map.removeLayer(olLayer);
							}
						},
						setSelections : function() {
							var card = this.interactionDocument.getCurrentCard();
							this.map
									.getLayers()
									.forEach(
											function(layer) {
												var adapter = layer.get("adapter");
												if (adapter && adapter.setStatus) {
													var geoAttribute = layer.get("geoAttribute");
													adapter
															.setStatus((geoAttribute && geoAttribute.masterTableName === card.className) ? "Select"
																	: "None");
												}
											});

						},
						clearSelections : function() {
							var gisLayers = this.interactionDocument.getGisAdapters();
							for ( var key in gisLayers) {
								var namedAdapters = gisLayers[key];
								for (var i = 0; i < namedAdapters.length; i++) {
									namedAdapters[i].adapter.clearSelections();
								}
							}

						},
						/**
						 * @param {Array} :
						 *            allLayers : layers from _CMCACHE
						 * @param {Array}
						 *            visibles : layers from _CMCACHE
						 * 
						 * @returns {Void}
						 */
						removeNotVisibleLayers : function(allLayers, visibles) {
							var allLayers = [];
							var mapLayers = this.map.getLayers();
							mapLayers.forEach(function(mapLayer) {
								allLayers.push(mapLayer);
							});

							var me = this;
							var index = 0;
							for (var i = 0; i < allLayers.length; i++) {
								var mapLayer = allLayers[i];
								var geoAttribute = mapLayer.get("geoAttribute");
								if (geoAttribute) {
									me.remove4GeoAttribute(mapLayer, geoAttribute, visibles);
								}
							}
						},

						/**
						 * @param {Object}
						 *            geoAttribute
						 * @param {Array}
						 *            visibles : layers from _CMCACHE
						 * 
						 * @returns {Void}
						 */
						remove4GeoAttribute : function(mapLayer, geoAttribute, visibles) {
							var mapLayerName = geoAttribute.name;
							var mapClassName = geoAttribute.masterTableName;
							var found = false;
							for (var i = 0; i < visibles.length; i++) {
								var layer = visibles[i];
								if (layer.name === mapLayerName && layer.masterTableName === mapClassName) {
									found = true;
								}
							}
							if (!found) {
								var adapter = mapLayer.get("adapter");
								if (adapter) {
									adapter.refresh();
									adapter.closeAllEditings();

								}
								this.clearHideLayer(mapClassName, mapLayerName);
								this.map.removeLayer(mapLayer);
							}
						},

						/**
						 * @param {Array}
						 *            visibles : layers from _CMCACHE
						 * 
						 * @returns {Void}
						 */
						removeThematicsNotVisibleLayers : function(currentThematicLayerName) {
							var allLayers = this.interactionDocument.getAllThematicLayers();
							var me = this;
							var active = this.interactionDocument.getThematismActive();
							allLayers.forEach(function(layer) {
								if (layer.name !== currentThematicLayerName || !active) {
									me.removeLayerByName(layer.masterTableName, layer.name);

								}
							});
						},
						showCurrent : function(card) {
							if (this.interactionDocument.isCardOnMap(card)) {
								var features = this.current.getFeatures();
								features.clear();
							} else {
								this.interactionDocument.getPosition(card, function(center) {
									if (!center) {
										return;
									}
									var thing = new ol.Feature({
										geometry : new ol.geom.Point(center)
									});
									var features = this.current.getFeatures();
									features.clear();
									this.map.addInteraction(this.current);
									features.push(thing);

								}, this);
							}
						},
						makePointSelect : function() {
							var selectPoints = new ol.style.Style({
								image : new ol.style.Circle({
									fill : new ol.style.Fill({
										color : 'orange'
									}),
									stroke : new ol.style.Stroke({
										color : 'yellow'
									}),
									radius : CMDBuild.gis.constants.layers.DEFAULT_RADIUS
								})
							});
							var me = this;
							return new ol.interaction.Select({
								style : [ selectPoints ],
								wrapX : false
							})
						},
						getMapCenter : function() {
							var extent = this.map.getView().calculateExtent(this.map.getSize());
							return extent;
						}
					});
	function isVisible(visibles, layer) {
		for (var i = 0; i < visibles.length; i++) {
			if (visibles[i].name === layer.name) {
				return true;
			}
		}
		return false;
	}

})();
