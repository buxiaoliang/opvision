(function() {
	var EXPANDING_LEVEL = 2;
	var ICON_ACTION = "action-open-bim";
	var MAX_ZOOM = 15;
	var index = 0;

	Ext.define("CMDBuild.bim.management.CMBimController", {
		uses: [
			'CMDBuild.bim.proxy.Bim', 
			'CMDBuild.core.Message'
		],
		mixins : {
			cardGrid : "CMDBuild.view.management.common.CMCardGridDelegate"
		},
		transparence : .5, ////NB!!!!!!
		
		constructor : function(view) {
			// this must be loaded with BIM configuration
			// before to initialize the application
			this.rootClassName = CMDBuild.configuration.bim.get('rootClass'); // TODO:
			// use
			// proxy
			// constants
			this.layers = {}, this.view = view;
			this.view.addDelegate(this);

			// this.loginProxy = new BIMLoginProxy();
			// this.bimOnThree =
			// Ext.create("CMDBuild.bim.surfer.BimOnThree.BimOnThree");
			this.bimWindow = null;
			this.bimSceneManager = null;
			this.viewportEventListener = null;
			this.currentObjectId = null;
			this.roid = null;
			this.basePoid = null;
		},

		/**
		 * 
		 * @param {CMDBuild.view.management.common.CMCardGrid}
		 *            grid
		 */
		onCMCardGridColumnsReconfigured : function(grid) {
			var entryType = _CMCardModuleState.entryType;
			var me = this;
			CMDBuild.bim.proxy.Bim.activeForClassName({
				params : {
					className : entryType.getName()
				},
				success : function(operation, options, response) {
					if (response.active) {
						var column = Ext.create('Ext.grid.column.Column', {
							align : 'center',
							dataIndex : 'Id',
							fixed : true,
							header : '&nbsp',
							hideable : false,
							menuDisabled : true,
							renderer : renderBimIcon,
							sortable : false,
							width : 30
						});

						grid.headerCt.insert(grid.columns.length - 1, column);
						grid.getView().refresh();
					}
				}
			});

		},

		/**
		 * 
		 * @param {CMDBuild.view.management.common.CMCardGrid}
		 *            grid
		 */
		onCMCardGridIconRowClick : function(grid, action, model) {
			if (action == ICON_ACTION) {
				CMDBuild.core.LoadMask.show();
				var me = this;
				var entryType = _CMCardModuleState.entryType;
				CMDBuild.bim.proxy.Bim.roidForCardId({
					params : {
						cardId : model.get("Id"),
						className : entryType.getName(),
						withExport : true
					},
					success : function(operation, options, response) {
						if (response.ROID) {
							me.startBIMPlayer(response.ROID, response.DESCRIPTION, response.BASE_POID);
							// me.bimOnThree.load({
							// poid : response.BASE_POID,
							// roid : response.ROID,
							// schema : "ifc4",
							// bimserver : true,
							// username :
							// CMDBuild.configuration.bim.get('username'),
							// password :
							// CMDBuild.configuration.bim.get('password')
							// })
						} else {
							CMDBuild.core.Message.warning(CMDBuild.Translation.warning, //
							CMDBuild.Translation.no_bim_project_for_card);
						}
						CMDBuild.core.LoadMask.hide();
					},
					failure : function() {
						me.startBIMPlayer(0, "CMDBuild Bim Viewer", 0);
						CMDBuild.core.LoadMask.hide();
					}
				});
			}
		},
		selectGraphicNode : function(nodeId) {
			this.bimWindow.selectNode(nodeId);
		},
		selectNode : function(oid, isLeaf) {
			this.bimSceneManager.select(oid, isLeaf);
		},
		/***********************************************************************
		 * As scene manager delegate
		 **********************************************************************/
		ifcTreeLoaded : function(IfcTree) {
			this.ifcRoot = this.loadIfcNode(0, IfcTree.getRoot());
			this.ifcRoot.expanded = true;
			this.layers = this.analyzeLayers(this.ifcRoot);
			this.bimWindow.loadLayers(this.layers);
			this.bimWindow.setTreeRootNode(this.ifcRoot);
		},
		loadIfcNode : function(level, node) {
			// if (node.ifcObject.object._t === "IfcBeam") {
			// return null;
			// }
			var treeNode = {
				id : node.ifcObject.oid,
				_t : node.ifcObject.object._t,
				text : node.ifcObject.object._t + " " + node.ifcObject.object.Name,
				expanded : level <= EXPANDING_LEVEL,
				leaf : node.children.length === 0,
				children : []

			}
			for (var i = 0; i < node.children.length; i++) {
				var treeChild = this.loadIfcNode(level + 1, node.children[i]);
				if (treeChild) {
					treeNode.children.push(treeChild);
				}
			}
			return treeNode;
		},
		loadRecursively : function(layers, node) {
			if (!layers[node._t]) {
				layers[node._t] = {
					id : node.id,
					description : node._t,
					checked : true,
					qt : 1
				};
			} else {
				layers[node._t].qt += 1;
			}
			for (var i = 0; node.children && i < node.children.length; i++) {
				var child = node.children[i];
				this.loadRecursively(layers, child);
			}
		},
		analyzeLayers : function(root) {
			var layers = {};
			this.loadRecursively(layers, root);

			return toArray(layers);
		},
		layerDisplayed : function(sceneManager, layerName) {
			if (this.bimWindow) {
				this.bimWindow.selectLayer(layerName);
			}
		},

		objectSelected : function(sceneManager, objectId) {
			this.currentObjectId = objectId;
			_debug("Object selected", objectId);
			if (this.bimWindow) {
				this.bimWindow.enableObjectSliders();
				this.bimWindow.tree.selectNodeByOid(objectId);
			}
		},

		objectSelectedForLongPressure : function(sceneManager, objectId) {
			var me = this;

			CMDBuild.bim.proxy.Bim.fetchCardFromViewewId({
				params : {
					revisionId : me.roid,
					objectId : objectId
				},

				success : function(fp, request, response) {
					if (response.card) {
						openCardDataWindow(me, response.card);
					}
				}
			});
		},
		getCurrentRoid: function() {
			return this.roid;
		},
		openCardDataWindow: function(card) {
			var me = this;
			var classId = card.IdClass;

			_CMCache.getAttributeList(classId, function(attributes) {
				var cardWindow = new CMDBuild.bim.view.CMCardDataWindow({
					cmCardData : card,
					attributeConfigurations : attributes,
					delegate : me
				});
				cardWindow.show();

			});

		},
		selectionCleaned : function() {
			this.currentObjectId = null;
			if (this.bimWindow) {
				this.bimWindow.disableObjectSliders();
			}
		},

		bimSceneManagerGeometryAdded : function(sceneManager, oid) {
			this.bimWindow.tree.checkNode(oid);
		},

		/***********************************************************************
		 * As CMBimWindow delegate
		 **********************************************************************/

		/*
		 * @param {CMDBuild.bim.management.view.CMBimPlayerLayers} bimLayerPanel
		 * the layers panel that call the method @param {String} ifcLayerName
		 * the name of the layer for which the check is changed @param {Boolean}
		 * checked the current value of the check
		 */
		onLayerCheckDidChange : function(bimLayerPanel, ifcLayerNames, checked) {
			for (var i = 0; i < ifcLayerNames.length; i++) {
				var ifcLayerName = ifcLayerNames[i];
				if (checked) {
					this.bimSceneManager.showLayer(ifcLayerName);
				} else {
					this.bimSceneManager.hideLayer(ifcLayerName);
				}
			}
			this.bimSceneManager.changeTransparence(this.transparence);
		},

		/***********************************************************************
		 * As CMBimControlPanel delegate
		 **********************************************************************/

		onBimControlPanelResetButtonClick : function() {
			this.bimSceneManager.defaultView();
		},

		onBimControlPanelFrontButtonClick : function() {
			this.bimSceneManager.frontView();
		},

		onBimControlPanelSideButtonClick : function() {
			this.bimSceneManager.sideView();
		},

		onBimControlPanelTopButtonClick : function() {
			this.bimSceneManager.topView();
		},

		onBimControlPanelPanButtonClick : function() {
			this.bimSceneManager.togglePanRotate();
		},

		onBimControlPanelRotateButtonClick : function() {
			this.bimSceneManager.togglePanRotate();
		},

		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelZoomSliderChange : function(value) {
			var zoom = MAX_ZOOM - (value / 5);
			this.bimSceneManager.setZoomLevel(zoom);
		},

		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelExposeSliderChange : function(value) {
		},

		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelTransparentSliderChange : function(value) {
			this.transparence = (value > 90) ? .99 : value / 100.0;
			this.bimSceneManager.changeTransparence(this.transparence);
		},

		// CMCardDataWinodwDelegate

		/**
		 * @param {CMDBuild.bim.view.CMCardDataWindow}
		 *            cardDataWindow
		 */
		cardDataWindowOpenCardButtonWasClicked : function(cardDataWindow) {
			var cardData = cardDataWindow.cmCardData;
			cardDataWindow.destroy();
			openCard(this, cardData.IdClass, cardData.Id);
		},
		/**
		 * @param {CMDBuild.bim.view.CMCardDataWindow}
		 *            cardDataWindow
		 */
		cardDataWindowOkButtonWasClicked : function(cardDataWindow) {
			cardDataWindow.destroy();
		},

		// CMBimTreeDelegate

		onNodeCheckChange : function(node, check) {
			var oid = node.raw.oid;
			if (check) {
				this.bimSceneManager.showObject(oid);
			} else {
				this.bimSceneManager.hideObject(oid);
			}
		},

		onNodeSelect : function(node, fromViewer) {
			this.bimSceneManager.selectObject(node.raw.oid, fromViewer);
		},

		onOpenCardIconClick : function(classId, cardId) {
			openCard(this, classId, cardId);
		},
		startBIMPlayer : function(roid, description, basePoid) {
			this.roid = roid;
			this.bimWindow = new CMDBuild.bim.management.view.CMBimWindow({
				delegate : this

			});
			this.bimWindow.show();
			this.bimWindow.setTitle(description);
			this.bimSceneManager = Ext.create("CMDBuild.bim.surfer.Viewer");
			this.bimSceneManager.show(basePoid, "ifc2x3tc1", this);
			var me = this;
			this.bimWindow.mon(this.bimWindow, "beforehide", function() {
				Ext.destroy(me.bimSceneManager);
			});
		}

	});

	function openCard(me, classId, cardId) {
		me.bimWindow.close();
		CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', {
			IdClass : classId,
			Id : cardId
		});
	}

	function convertCMDBuildData(data) {
		var properties = data.properties; // map {oid: {}, oid: {}...}
		var relations = data.relationships; // tree

		var project = relations[0];
		return convertNode(project, properties);
	}

	function convertNode(relationshipNode, properties) {
		var out = {};
		var nodeData = properties[relationshipNode.id] || {};
		var cmdbuildData = nodeData.cmdbuild_data || {};
		out.text = cmdbuildData.card_description || nodeData.Name;
		out.leaf = true;
		out.checked = false;
		out.oid = relationshipNode.id;
		out.cmdbuild_data = cmdbuildData;

		if (relationshipNode.contains || relationshipNode.definedBy) {
			out.leaf = false;

			out.children = convertNodes(relationshipNode.decomposedBy, properties).concat(
					convertNodes(relationshipNode.contains, properties));

			if (relationshipNode.type) {
				out.text += " (" + relationshipNode.type + ")";
			}
		}

		return out;
	}

	function convertNodes(nodes, properties) {
		var out = [];
		var input = nodes || [];
		for (var i = 0, l = input.length; i < l; ++i) {
			var node = input[i];
			out.push(convertNode(node, properties));
		}

		return out;
	}


	function renderBimIcon() {
		return '<img style="cursor:pointer"' + '" class="' + ICON_ACTION + '" title="'
				+ CMDBuild.Translation.open_3d_viewer + '" src="images/icons/application_home.png"/>';
	}
	function toArray(layers) {
		var arLayers = [];
		for ( var key in layers) {
			arLayers.push(layers[key]);
		}
		return arLayers;
	}
})();