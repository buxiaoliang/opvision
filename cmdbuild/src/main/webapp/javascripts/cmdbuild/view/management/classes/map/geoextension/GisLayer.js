(function() {
	Ext.require([ 'CMDBuild.core.constants.Proxy', 'CMDBuild.proxy.gis.Icon' ]);
	Ext.define('CMDBuild.view.management.classes.map.geoextension.GisLayer', {

		/**
		 * @property {ol.style.Icon}
		 * 
		 */
		classBitmap : undefined,

		/**
		 * 
		 * @property {String}
		 * 
		 */
		attributeType : undefined,

		/**
		 * 
		 * @property {String}
		 * 
		 */
		status : undefined,
		visibleFeatures : [],
		notVisibleFeatures : [],

		/**
		 * 
		 * @property {Boolean} say if a feature's geometry is changed by user
		 * 
		 */
		changedFeature : false,

		/**
		 * 
		 * @property {Style}
		 * @property {String} externalGraphic
		 * @property {String} fillColor
		 * @property {Number} fillOpacity
		 * @property {Integer} pointRadius
		 * @property {String} strokeColor
		 * @property {Number} strokeOpacity
		 * @property {Integer} strokeWidth
		 * 
		 */
		style : undefined,

		/**
		 * @property {Object[className][cardId]}
		 * 
		 */
		justImmissedFeatures : {},

		/**
		 * @param {String}
		 *            attributeName
		 * @param {Object}
		 *            options
		 * @param {ol.Map}
		 *            map
		 * 
		 * @returns {ol.layer.Vector}
		 * 
		 */
		buildGisLayer : function(attributeName, options, map) {
			var me = this;
			this.attributeType = options.geoAttribute.type;
			this.attributeName = options.geoAttribute.name;
			this.className = options.geoAttribute.masterTableName;
			this.vectorSource = this.getVectorSource(options);
			this.minZoom = options.minZoom, this.maxZoom = options.maxZoom
			var view = new ol.View({
				projection : "EPSG:900913"
			});

			this.createControls(map, this.vectorSource, options);
			var gisLayer = new ol.layer.Vector({
				name : options.geoAttribute.name,
				source : this.vectorSource,
				view : view,
				geoAttribute : options.geoAttribute,
				adapter : this
			});
			var styleFunction = function(feature) {
				return me.getStyle(feature.getGeometry().getType());
			};
			gisLayer.setStyle(styleFunction);
			this.interactionDocument.pushGisLayerAdapter(options.geoAttribute.name,
					options.geoAttribute.masterTableName, this)
			this.status = "Select";
			this.interactionDocument.setCurrentFeature(options.geoAttribute.name, "", "Select");
			this.interactionDocument.changedFeature();
			return gisLayer;
		},

		constructor : function(geoAttribute, withEditWindow, interactionDocument) {
			var options = {
				geoAttribute : geoAttribute,
				targetClassName : geoAttribute.masterTableName,
				iconUrl : geoAttribute.style.externalGraphic,
				minZoom : geoAttribute.minZoom,
				maxZoom : geoAttribute.maxZoom
			};
			this.style = geoAttribute.style;
			this.interactionDocument = interactionDocument;
			var map = this.interactionDocument.getMap();
			this.classBitmap = (geoAttribute.iconSize && geoAttribute.iconSize[0] > 0) ? this.loadIcon(options.iconUrl,
					geoAttribute.iconSize) : null;
			this.layer = this.buildGisLayer(geoAttribute.name, options, map);
			this.layer.set("name", geoAttribute.name);
			this.interactionDocument.observeFeatures(this);
			this.interactionDocument.observeNavigables(this);
			this.callParent(arguments);
		},
		createControls : function(map, vectorSource, options) {
			var me = this;
			this.makeSelect();
			this.modify = new ol.interaction.Modify({
				features : this.select.getFeatures()
			});
			this.modify.on('modifyend', function(event) {
				me.changedFeature = true;
			});
			this.makeDrawPoint(map, vectorSource);
			this.makeDrawPolygon(map, vectorSource);
			this.makeDrawLine(map, vectorSource);
			this.select.on('select', function(event) {
				me.interactionDocument.setNoZoom(true);
				if (event.selected.length === 0) {
					me.interactionDocument.changed();
					return false;
				}
				var selectedId = event.selected[0].get("master_card");
				if (!me.interactionDocument.getCursorActive()) {
					me.interactionDocument.setCursorActive(true);
					me.interactionDocument.changedThematicDocument();
				}

				var currentId = (_CMCardModuleState.card) ? _CMCardModuleState.card.get("Id") : -1;
				if (selectedId == currentId) {
					return false;
				}
				var card = {
					Id : event.selected[0].get("master_card"),
					IdClass : event.selected[0].get("master_class")
				};
				CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', card);
			});
			map.addInteraction(this.select);
			map.addInteraction(this.modify);
			var card = this.interactionDocument.getCurrentCard();
			this.select.setActive(this.interactionDocument.sameClass(options.geoAttribute.masterTableName,
					card.className));
			this.modify.setActive(false);
		},
		makeDrawLine : function(map, vectorSource) {
			var me = this;
			this.drawLine = new ol.interaction.Draw({
				source : vectorSource,
				type : ('LineString')
			});
			this.drawLine.on('drawend', function(event) {
				me.changedFeature = true;
				me.newFeature(event.feature);
				map.removeInteraction(me.drawLine);
				me.makeDrawLine(map, me.getSource());
			});
			this.drawLine.setActive(false);
			map.addInteraction(this.drawLine);

		},
		makeDrawPolygon : function(map, vectorSource) {
			var me = this;
			this.drawPolygon = new ol.interaction.Draw({
				source : vectorSource,
				type : ('Polygon')
			});
			this.drawPolygon.on('drawend', function(event) {
				me.changedFeature = true;
				me.newFeature(event.feature);
				map.removeInteraction(me.drawPolygon);
				me.makeDrawPolygon(map, me.getSource());
			});
			this.drawPolygon.setActive(false);
			map.addInteraction(this.drawPolygon);

		},
		makeDrawPoint : function(map, vectorSource) {
			var me = this;
			this.drawPoint = new ol.interaction.Draw({
				source : vectorSource,
				type : ('Point')
			});
			this.drawPoint.on('drawend', function(event) {
				me.changedFeature = true;
				me.drawPoint.setActive(false);
				me.newFeature(event.feature);
				map.removeInteraction(me.drawPoint);
				me.makeDrawPoint(map, me.getSource());
			});
			this.drawPoint.setActive(false);
			map.addInteraction(this.drawPoint);

		},
		onRemovedFeature : function() {
			this.changedFeature = CMDBuild.gis.constants.gisLayer.FEATURE_REMOVED;
		},
		/**
		 * 
		 * @returns {String}
		 * 
		 */
		getAttributeType : function() {
			return this.attributeType;
		},

		/**
		 * 
		 * @returns {Array} ids
		 * 
		 */
		getCardsOnLayer : function() {
			var source = this.getSource();
			var features = (source) ? source.getFeatures() : new ol.Collection();
			var cards = [];
			features.forEach(function(feature) {
				cards.push(feature.get("master_card"));
			});
			return cards;
		},

		/**
		 * @param {Integer}
		 *            cardId
		 * 
		 * @returns {Array[ol.Feature]} features
		 * 
		 */
		getFeaturesByCardId : function(cardId) {
			return this.interactionDocument.getFeaturesOnLayerByCardId(cardId, this.layer);
		},

		/**
		 * 
		 * @returns {ol.layer.Vector}
		 * 
		 */
		getLayer : function() {
			return this.layer;
		},

		/**
		 * 
		 * @returns {ol.Source}
		 * 
		 */
		getSource : function() {
			return this.layer.getSource();
		},
		onlyToAddFeatures : function(visibleFeatures) {
			var features = [];
			var layerFeatures = this.getSource().getFeatures();
			for (var i = 0; i < visibleFeatures.length; i++) {
				var visibleFeature = visibleFeatures[i];
				if (!inLayerFeatures(visibleFeature, layerFeatures)) {
					features.push(visibleFeature);
				}
			}
			return features;

		},
		removeNotVisibleFeatures : function(visibleFeatures) {
			var layerFeatures = this.getSource().getFeatures();
			for (var i = 0; i < layerFeatures.length; i++) {
				var layerFeature = layerFeatures[i];
				if (!inVisibleFeatures(layerFeature, visibleFeatures)) {
					this.getSource().removeFeature(layerFeature);
				}
			}
		},
		clearJustOperatedFeatures : function(features) {
			var cleanedFeatures = [];
			for (var i = 0; i < features.length; i++) {
				var feature = features[i];
				var className = feature.properties.master_className;
				var cardId = feature.properties.master_card;
				if (!this.justImmissedFeatures[className]) {
					this.justImmissedFeatures[className] = {};
				}
				if (!this.justImmissedFeatures[className][cardId]) {
					this.justImmissedFeatures[className][cardId] = true;
					cleanedFeatures.push(feature);
				}
			}
			return cleanedFeatures;
		},
		_callLoading : function(params, geoJSONFormat) {
			this.interactionDocument.featuresLoader.loadFeatures(params, function(data) {
				if (!data) {
					return;
				}
				var features = this.clearJustOperatedFeatures(data.features);
				var splittedFeatures = splitFeatures(features)
				this.loadNavigableFeatures(this.className, this.attributeName, splittedFeatures, 0, function() {
					this.getFeatures(data, geoJSONFormat, this.vectorSource);
				}, this);
			}, this);

		},
		waitLoading : function(params, geoJSONFormat) {
			this.stopped = false;
			this.callLoading(params, geoJSONFormat);
		},
		callLoading : function(params, geoJSONFormat) {
			// when the refresh is called more times it takes
			// the last
			var zoom = this.interactionDocument.getZoom();
			if (zoom < this.minZoom || zoom > this.maxZoom) {
				return;
			}
			var me = this;
			if (this.operation) {
				clearTimeout(this.operation);
			}
			if (this.stopped === true) {
				this.operation = setTimeout(me.waitLoading(params, geoJSONFormat), 100);
			} else {
				this.operation = setTimeout(function() {
					me.stopped = true;
					me._callLoading(params, geoJSONFormat);
					me.operation = undefined;
				}, 50);
			}
		},
		getVectorSource : function(options) {
			var me = this;
			var geoJSONFormat = new ol.format.GeoJSON();
			var loader = function(extent, resolution, projection) {
				var params = {
					className : options.targetClassName,
					attribute : options.geoAttribute.name,
					bbox : extent.join(",")
				}
				me.callLoading(params, geoJSONFormat);
			}
			var vectorSource = new ol.source.Vector({
				strategy : ol.loadingstrategy.bbox,
				loader : loader
			});
			return vectorSource;
		},
		loadNavigableFeatures : function(className, attributeName, splittedFeatures, index, callback, callbackScope) {
			if (index >= splittedFeatures.length) {
				callback.apply(callbackScope, []);
				return;
			}
			var features = splittedFeatures[index];
			index++;
			this.loadNavigables(className, attributeName, features, function() {
				this.loadNavigableFeatures(className, attributeName, splittedFeatures, index, callback, callbackScope)
			}, this);
		},
		getFeatures : function(data, geoJSONFormat, vectorSource) {
			var visibleFeatures = this.onlyVisibleFeatures(data.features);
			data.features = this.onlyToAddFeatures(visibleFeatures);
			var jsonFeatures = geoJSONFormat.readFeatures(data);
			vectorSource.addFeatures(jsonFeatures);
			this.interactionDocument.onLoadedfeatures(this.layer.get("name"), jsonFeatures);
			// this.removeNotVisibleFeatures(visibleFeatures);
		},
		loadIcon : function(url, naturalSize) {
			var icon = undefined;
			try {
				icon = new ol.style.Icon({
					src : url,
					scale : CMDBuild.gis.constants.layers.ICON_SCALE * this.style.pointRadius / naturalSize[0]
				});

			} catch (e) {
				icon = null;
			}
			return icon;
		},

		loadNavigables : function(className, attributeName, features, callback, callbackScope) {
			this.interactionDocument.loadFeaturesOnNavigationTree(className, attributeName, features, function() {
				callback.apply(callbackScope, []);
			})
		},
		onlyVisibleFeatures : function(featuresOnLayer) {
			var features = [];
			this.visibleFeatues = [];
			this.notVisibleFeatures = [];
			var geoAttribute = this.layer.get("geoAttribute");
			var bControlledByNavigation = this.interactionDocument.isANavigableClass(geoAttribute.masterTableName);
			for (var i = 0; i < featuresOnLayer.length; i++) {
				var feature = featuresOnLayer[i];
				feature.geometry.type = changeType(feature.geometry.type);
				if (!bControlledByNavigation || this.isAVisibleFeature(feature)) {
					features.push(feature);
					this.visibleFeatures.push(feature);

				} else {
					this.notVisibleFeatures.push(feature);
				}
			}
			return features;
		},

		isAVisibleFeature : function(feature) {
			if (!(feature && feature.properties)) {
				return false;
			}
			var card = {
				className : feature.properties.master_className,
				cardId : feature.properties.master_card
			};
			if (this.interactionDocument.isANavigableCard(card)) {
				return true;
			} else {
				return false;
			}
		},

		/**
		 * 
		 * @returns {Void}
		 * 
		 */
		refresh : function() {
			// this.layer.getSource().clear();
		},
		/**
		 * 
		 * @returns {Void}
		 * 
		 */
		refreshNavigables : function() {
			this.layer.getSource().clear();
		},

		/**
		 * 
		 * @param {String}
		 *            status
		 * 
		 */
		setStatus : function(status) {
			var map = this.interactionDocument.getMap();
			var feature = this.interactionDocument.getCurrentFeature();
			var geoType = feature.geoType;
			var geoAttribute = this.layer.get("geoAttribute");
			var currentCard = this.interactionDocument.getCurrentCard();
			this.drawPoint.setActive(status === "Draw" && geoType === "POINT"
					&& this.interactionDocument.sameClass(geoAttribute.masterTableName, currentCard.className));
			this.drawPolygon.setActive(status === "Draw" && geoType === "POLYGON");
			this.drawLine.setActive(status === "Draw" && geoType === "LINESTRING");
			this.select.setActive(status === "Select"
					&& this.interactionDocument.sameClass(geoAttribute.masterTableName, currentCard.className));
			this.modify.setActive(status === "Modify");
			this.status = status;
		},
		/**
		 * 
		 * @returns {Void}
		 * 
		 */
		refreshCurrentFeature : function() {
			var feature = this.interactionDocument.getCurrentFeature();
			var nameLayer = this.getLayer().get("name");
			var nameAttribute = feature.nameAttribute;
			if (feature.operation === "Draw" && nameAttribute && nameAttribute !== nameLayer) {
				this.setStatus("None");
				return;
			}
			switch (feature.operation) {
			case "Modify":
				var card = this.interactionDocument.getCurrentCard();
				if (this.changedFeature !== CMDBuild.gis.constants.gisLayer.FEATURE_REMOVED) {
					this.changedFeature = false;
					if (card.cardId !== -1) {
						var selected = this.selectFeaturesByCardId(card);
						if (selected.length > 0) {
							this.setStatus("Modify")

						}
					}
				}
				break;
			case "Draw":
				this.changedFeature = false;
				this.setStatus("Draw")
				break;
			case "Select":
				this.setStatus("Select")
				break;
			default:
				;
			}
		},

		/**
		 * 
		 * @returns {Void}
		 * 
		 */
		newFeature : function(feature) {
			var currentCard = this.interactionDocument.getCurrentCard();
			feature.set("master_card", currentCard.cardId);
			feature.set("master_className", currentCard.className);
			var cl = this.interactionDocument.getEntryTypeByName(currentCard.className);
			feature.set("master_class", cl.get("id"));
			this.clearSelections();
			this.select.setActive(false);
		},
		closeAllEditings : function() {
			this.clearAllFeatures();
			this.clearSelections();
			this.drawPoint.setActive(false);
			this.drawPolygon.setActive(false);
			this.drawLine.setActive(false);
			this.modify.setActive(false);
			this.select.setActive(false);
		},
		removeById : function(id) {

		},
		changeFeature : function(newId) {
			var newFeatures = [];
			var features = this.getFeaturesByCardId(-1); // can be an insert
			if (features.getLength() === 0) { // or a modify
				features = this.getFeaturesByCardId(newId);
			}
			features.forEach(function(feature) {
				newFeatures.push(feature);
			});
			var toRemove = [];
			features.forEach(function(feature) {
				toRemove.push(feature);
			});
			var source = this.getSource();
			features = source.getFeatures();
			for (var i = 0; i < toRemove.length; i++) {
				source.removeFeature(toRemove[i]);
			}
			for (var i = 0; i < newFeatures.length; i++) {
				newFeatures[i].set("master_card", newId);
				features.push(newFeatures[i]);
			}
			this.interactionDocument.changed();
			this.setStatus("Select");
		},
		inFilterSelect : function(feature, layer) {
			if (this.interactionDocument.getEditing()) {
				return false;
			}
			if (!layer) {
				return false;
			}
			if (this.status !== "Select") {
				return false;
			}
			var geoAttribute = layer.get("geoAttribute");
			if (!geoAttribute) {
				return false;
			}
			var currentCard = this.interactionDocument.getCurrentCard();
			var layerClassName = geoAttribute.masterTableName;
			var featureClassName = feature.get("master_className");
			return this.interactionDocument.sameClass(currentCard.className, featureClassName);

		},
		makePointSelect : function(feature, layer) {
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
				filter : function(feature, layer) {
					return me.inFilterSelect(feature, layer);
				},
				style : [ this.getStyle("Point"), selectPoints ],
				wrapX : false
			})
		},
		makeLineSelect : function(feature, layer) {
			var me = this;
			var styleLine = new ol.style.Style({
				stroke : new ol.style.Stroke({
					width : this.style.strokeWidth,
					color : 'rgba(255, 100, 0, .5)'
				})
			});
			return new ol.interaction.Select({
				filter : function(feature, layer) {
					return me.inFilterSelect(feature, layer);
				},
				wrapX : false,
				style : styleLine
			})
		},
		makePolygonSelect : function(feature, layer) {
			var me = this;
			var stylePoligon = new ol.style.Style({
				stroke : new ol.style.Stroke({
					color : 'yellow'
				}),
				fill : new ol.style.Fill({
					color : 'rgba(255, 100, 0, .5)'
				})
			});
			return new ol.interaction.Select({
				filter : function(feature, layer) {
					return me.inFilterSelect(feature, layer);
				},
				wrapX : false,
				style : stylePoligon
			})
		},
		makeSelect : function() {

			var me = this;
			switch (this.attributeType) {
			case "POINT":
				this.select = this.makePointSelect();
				break;
			case "POLYGON":
				this.select = this.makePolygonSelect();
				break;
			case "LINESTRING":
				this.select = this.makeLineSelect();
				break;
			}
		},
		selectFeaturesByCardId : function(card) {
			var retFeatures = [];
			var features = this.select.getFeatures();
			try {
				features.clear();
			} catch (e) {
				console.log("Error on selectFeaturesByCardId ", card);
			}
			var featuresOnLayer = this.getFeaturesByCardId(card.cardId);
			featuresOnLayer.forEach(function(feature) {
				if (feature.get("master_card") == card.cardId) {
					features.push(feature);
					retFeatures.push(feature);
				}
			});
			return retFeatures;
		},
		featureOnThisLayer : function() {
			var feature = this.interactionDocument.getCurrentFeature();
			var nameAttribute = feature.nameAttribute;
			var nameLayer = this.getLayer().get("name");
			return nameAttribute === nameLayer;
		},
		getGeometries : function(cardId, className) {
			if (!this.changedFeature) {
				return null;
			}
			if (this.changedFeature === CMDBuild.gis.constants.gisLayer.FEATURE_REMOVED) {
				this.changedFeature = false;
				return CMDBuild.gis.constants.gisLayer.FEATURE_REMOVED;
			}
			this.changedFeature = false;
			var featuresOnLayer = this.getFeaturesByCardId(cardId);
			var translation = null;
			featuresOnLayer.forEach(function(feature) {
				var geojson = new ol.format.GeoJSON();
				var json = geojson.writeFeature(feature);
				translation = translate2CMDBuild(feature);
			});
			return translation;
		},
		clearFeatures : function(features) {
			if (features) {
				features.forEach(function(feature) {
					features.remove(feature);
				});
			}
		},
		clearSelections : function() {
			var features = this.select.getFeatures();
			features.clear();
		},
		clearAllFeatures : function() {
			this.clearSelections();
			this.layer.getSource().clear();
		},
		selectCard : function(card) {
			this.selectFeaturesByCardId(card);
		},
		getStyle : function(shape) {
			var fillColor = ol.color.asArray(this.style.fillColor);
			if (fillColor) { // can be a line
				fillColor = fillColor.slice();
				fillColor[3] = this.style.fillOpacity; // change the alpha

			}
			var strokeColor = ol.color.asArray(this.style.strokeColor);
			strokeColor = strokeColor.slice();
			strokeColor[3] = this.style.strokeOpacity;
			switch (shape) {
			case 'Point':
				if (!this.classBitmap) {
					return new ol.style.Style({
						image : new ol.style.Circle({
							fill : new ol.style.Fill({
								color : fillColor
							}),
							stroke : new ol.style.Stroke({
								width : this.style.strokeWidth,
								color : strokeColor
							}),
							radius : this.style.pointRadius

						})
					});
				} else {
					return new ol.style.Style({
						image : this.classBitmap
					});
				}
			case 'LineString':
				return new ol.style.Style({
					stroke : new ol.style.Stroke({
						color : strokeColor,
						width : this.style.strokeWidth
					})
				});
			case 'Polygon':
				return new ol.style.Style({
					stroke : new ol.style.Stroke({
						color : strokeColor,
						width : this.style.strokeWidth,
						lineDash : undefined
					}),
					fill : new ol.style.Fill({
						color : fillColor
					})
				});
			case 'Circle':
			default:
				return new ol.style.Style({
					stroke : new ol.style.Stroke({
						color : strokeColor,
						width : this.style.strokeWidth
					}),
					fill : new ol.style.Fill({
						color : fillColor
					})
				});
			}
			;
		}
	});
	function clearVectorSource(vectorSource) {
		try {
			var features = vectorSource.getFeatures();
			if (features) {
				features.forEach(function(feature) {
					vectorSource.removeFeature(feature);
				});
			}
		} catch (e) {
			console.log("Errore");
		}
	}
	function translate2CMDBuild(feature) {
		var geometry = feature.getGeometry();
		var str = "";
		var coordinates = geometry.getCoordinates();
		var type = geometry.getType();
		switch (type) {
		case "Point":
			str = "POINT(";
			str += coordinates[0] + " " + coordinates[1];
			str += ")";
			break;
		case "Polygon":
			coordinates = coordinates[0];
			str = "POLYGON((";
			for (var i = 0; i < coordinates.length; i++) {
				str += coordinates[i][0] + " " + coordinates[i][1];
				str += (i < coordinates.length - 1) ? "," : "";
			}
			str += "))";
			break;
		case "LineString":
			str = "LINESTRING(";
			for (var i = 0; i < coordinates.length; i++) {
				str += coordinates[i][0] + " " + coordinates[i][1];
				str += (i < coordinates.length - 1) ? "," : "";
			}
			str += ")";
			break;
		default:
			str = "not implemented";
		}
		return str;
	}
	function changeType(type) {
		switch (type) {
		case "POINT":
			return "Point";
		case "POLYGON":
			return "Polygon";
		case "LINESTRING":
			return "LineString";
		default:
			return type;
		}
	}
	function searchFeature(feature, featuresArray) {
		for (var i = 0; i < featuresArray.length; i++) {
			var className = featuresArray[i].get("master_className");
			var cardId = featuresArray[i].get("master_card");
			if (this.interactionDocument.sameClass(className, feature.get("master_className"))
					&& cardId === feature.get("master_card")) {
				return i;
			}
		}
		return -1;
	}
	function inLayerFeatures(feature, features) {
		for (var i = 0; i < features.length; i++) {
			if (features[i].get("master_card") === feature.properties.master_card) {
				return true;
			}
		}
		return false;
	}
	function inVisibleFeatures(feature, features) {
		for (var i = 0; i < features.length; i++) {
			var id = feature.get("master_card");
			if (id === features[i].properties.master_card) {
				return true;
			}
		}
		return false;
	}
	var pageLimit = 500;
	function splitFeatures(features) {
		var splittedFeatures = [];
		for (var i = 0; i < features.length; i += pageLimit) {
			var split = features.slice(i, i + pageLimit);
			splittedFeatures.push(split);
		}
		return splittedFeatures;
	}
	function featureIsVisible(feature, visibleFeatures) {
		var cardId = feature.properties.master_card;
		var className = feature.properties.master_className;
		for (var i = 0; i < visibleFeatures.length; i++) {
			var visibleCardId = visibleFeatures[i].get("master_card");
			var visibleClassName = visibleFeatures[i].get("master_className");
			if (visibleCardId === cardId && visibleClassName === className) {
				return true;
			}
		}
		return false;
	}
})();
