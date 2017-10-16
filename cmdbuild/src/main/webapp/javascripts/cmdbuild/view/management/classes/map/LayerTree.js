(function() {
	var EXTERNAL_LAYERS_FOLDER_NAME = "cm_external_layers_folder";
	var CMDBUILD_LAYERS_FOLDER_NAME = "cm_cmdbuild_layers_folder";
	var GEOSERVER_LAYERS_FOLDER_NAME = "cm_geoserver_layers_folder";
	var THEMATISM_LAYERS_FOLDER_NAME = "cm_thematism_layers_folder";
	Ext.define('CMDBuild.view.management.classes.map.LayerTree', {
		extend : "Ext.tree.Panel",

		requires : [ 'CMDBuild.proxy.gis.Layer' ],

		/**
		 * @cfg {CMDBuild.controller.management.classes.map.LayerTree}
		 */
		delegate : undefined,

		border : false,
		cls : 'cmdb-border-bottom',
		frame : false,

		map : undefined,

		/**
		 * @property {String}
		 */
		oldClassName : undefined,

		constructor : function() {
			var store = CMDBuild.proxy.gis.Layer.getStore();

			this.store = store;
			this.callParent(arguments);
		},
		/**
		 * @returns {Void}
		 * 
		 * @override
		 */
		initComponent : function() {
			this.interactionDocument.observe(this);
			this.interactionDocument.observeLayers(this);
			this.callParent(arguments);
		},
		checkNode : function(node, checked) {
			if (node.raw.leaf) {
				this.interactionDocument.getLayerByClassAndName(node.raw.className, node.raw.layerName,
						function(layer) {
							if (!layer) {
								layer = this.interactionDocument.getThematicLayerByName(node.raw.layerName);
							}
							this.delegate.cmfg('onVisibilityChange', {
								checked : checked,
								layer : layer
							});

						}, this);
			} else {
				var nodes = node.childNodes;
				for (var i = 0; i < nodes.length; i++) {
					this.checkNode(nodes[i], checked);
				}
			}
		},
		listeners : {
			checkchange : function(node, checked, eOpts) {
					this.checkNode(node, checked);
			}
		},

		/**
		 * @param {Object}
		 *            record
		 * @param {String}
		 *            record.Id
		 * @param {String}
		 *            record.IdClass
		 * 
		 * @returns {Void}
		 */
		navigateOnCard : function(record) {
			this.delegate.cmfg('onCardNavigation', {
				Id : record.get('Id'),
				IdClass : record.get('IdClass')
			});
		},
		refreshLayers : function(bHiding) {
			var currentCard = this.interactionDocument.getCurrentCard();
			if (!currentCard) {
				return;
			}
			var currentCardId = currentCard.cardId;
			var currentClassName = currentCard.className;
			var me = this;
			this.interactionDocument.getAllLayers(function(layers) {
				var root = me.getRootNode();
				for (var i = 0; i < layers.length; i++) {
					var node = nodeByNameAndClass(root, layers[i]);
					var visible = me.interactionDocument.isVisible(layers[i], currentClassName, currentCardId);
					var inZoom = me.inZoom(layers[i]);
					if (!visible) {
						; // nop
					} else if (visible && node && inZoom && bHiding === true) {
						var visibleLayer = me.interactionDocument.getLayerVisibility(layers[i]);
						node.set('checked', visibleLayer);
					} else if (visible && node && ! inZoom) {
							node.remove();
					} else if (visible && inZoom && !node) {
						me.addLayerItem(layers[i]);
					}
					else if (!visible && node) {
						node.remove();
					}
				}
//				var targetFolder = nodeByLayerName(me.getRootNode(), CMDBUILD_LAYERS_FOLDER_NAME);
//				targetFolder.expand();

			});
		},
		inZoom : function(layer) {
			var zoom = this.interactionDocument.getZoom();
			if (zoom < layer.minZoom || zoom > layer.maxZoom) {
				return false;
			}
			return true;
		},
		refresh : function() {
			var currentCard = this.interactionDocument.getCurrentCard();
			if (!currentCard) {
				return;
			}
			if (this.oldClassName !== currentCard.className) {
				clearTree(this.getRootNode());
			}
			this.oldClassName = currentCard.className;
			this.refreshLayers(true);
		},

		/**
		 * 
		 * @param {ol.Layer}
		 *            layer Add a node to the tree that represent the given
		 *            layer
		 * 
		 * @returns {Void}
		 */
		addLayerItem : function(layer) {
			var targetFolder = this.retrieveTargetFolder(layer, this.getRootNode());
			if (layer.masterTableName === CMDBuild.gis.constants.layers.THEMATISM_LAYER) {
				return;
			}
			var currentClassName = (Ext.isEmpty(_CMCardModuleState.entryType)) ? undefined
					: _CMCardModuleState.entryType.getName();
			var currentCardId = (Ext.isEmpty(_CMCardModuleState.card)) ? undefined : _CMCardModuleState.card.raw.Id;

			try {
				var strClass = toShow(currentClassName, layer.masterTableName);
				var child = targetFolder.appendChild({
					text : layer.name + strClass,
					layerName : layer.name,
					className : layer.masterTableName,
						leaf : true,
					checked : true
				});

				// passing the layerId with the configuration
				// has no effect. There is no time to
				// investigate... do it in the ugly way ;)
				child.layerId = layer.id;
				child.layerIndex = layer.cmdb_index;
			} catch (e) {
				console.log("Fail to add layer", layer);
			}
		},
		retrieveTargetFolder:function(layer, root) {
			var targetFolder = null;

			if (layer.isBaseLayer) {
				targetFolder = nodeByLayerName(root, EXTERNAL_LAYERS_FOLDER_NAME);
			} else if (layer.masterTableName === CMDBuild.gis.constants.layers.GEOSERVER_LAYER) {
				targetFolder = retrieveGeoserverFolder(root);
			} else if (layer.masterTableName === CMDBuild.gis.constants.layers.THEMATISM_LAYER) {
				//NOP
			} else {
				targetFolder = nodeByLayerName(root, CMDBUILD_LAYERS_FOLDER_NAME);
			}

			return targetFolder;
		}


	});
	function toShow(currentClassName, onLayerClassName) {
		if (CMDBuild.gis.constants.layers.THEMATISM_LAYER === onLayerClassName) {
			return "";
		}
		if (CMDBuild.gis.constants.layers.GEOSERVER_LAYER === onLayerClassName) {
			return "";
		}
		if (currentClassName === onLayerClassName) {
			return "";
		}
		return " (" + onLayerClassName + ")";
	}
	function clearNode(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}
	function clearTree(root) {
		var externalLayersFolder = nodeByLayerName(root, EXTERNAL_LAYERS_FOLDER_NAME);
		var gisServerFolder = nodeByLayerName(root, CMDBUILD_LAYERS_FOLDER_NAME);
		clearNode(externalLayersFolder);
		clearNode(gisServerFolder);
	}
	function retrieveGeoserverFolder(root) {
		var externalServicesFolder = nodeByLayerName(root, EXTERNAL_LAYERS_FOLDER_NAME);
		var geoserverFolder = nodeByLayerName(externalServicesFolder, GEOSERVER_LAYERS_FOLDER_NAME);

		if (!geoserverFolder) {
			geoserverFolder = externalServicesFolder.appendChild({
				text : CMDBuild.Translation.administration.modcartography.geoserver.title,
				layerName : GEOSERVER_LAYERS_FOLDER_NAME,
				checked : true
			});
		}

		return geoserverFolder;
	}

	function nodeByLayerName(root, layerName) {
		return root.findChildBy(function(child) {
			return child.raw.layerName === layerName;
		}, null, true);
	}
	function nodeByNameAndClass(root, layer) {
		return root.findChildBy(function(child) {
			return child.raw.layerName === layer.name && child.raw.className === layer.masterTableName;
		}, null, true);
	}
})();
