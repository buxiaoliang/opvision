//(function() {

	var CANVAS_ID = "divBim3DView";

	Ext.define("CMDBuild.bim.surfer.Viewer", {
		ifcTreeRoot : undefined,
		trasparentView : false,
		globalCurrentOid : null,
		transparenceValue : .5,
		transparentLayers : {},

		/*
		 * CMBimController passed during the project's show
		 */
		delegate : undefined,

		dumpSceneHierarchy : function() {
			SceneTree.dumpScene();
		},
		zoomLookAtPoint : function(point, distance, limits) {
			SceneTree.zoomLookAtPoint(point, distance, limits);
		},
		select : function(oid, isLeaf) {
			var clickSelect = SceneTree.getViewer().getControl("BIMSURFER.Control.ClickSelect");
			var orbit = SceneTree.getViewer().getControl("BIMSURFER.Control.PickFlyOrbit");
			this.globalCurrentOid = oid;
			var gid = SceneTree.getGid(oid);
			if (!isLeaf && ! gid) {
				this.showTransparentRecusively(IfcTree.getRoot(), this.globalCurrentOid, this.transparenceValue);
			}
			if (!gid) {
				return;
			}

			clickSelect.pick({
				nodeId : gid
			});
			var sceneObject = SceneTree.findNode(gid);
			var matrix = sceneObject.nodes[0].nodes[0];
			var worldMatrix = matrix.getWorldMatrix();
			var geometryNode = matrix.nodes[0];
			var color = geometryNode._core.arrays.colors;
			var boundary = geometryNode.getBoundary();
			/*
			 * Object {xmin: -150, ymin: -150, zmin: 0, xmax: 3950, ymax: 150,
			 * zmax: 2800}
			 * 
			 */
			var center = {
				x : (boundary.xmax - boundary.xmin) / 2,
				y : (boundary.ymax - boundary.ymin) / 2,
				z : (boundary.zmax - boundary.zmin) / 2
			}
			var centerTransformed = SceneJS_math_transformVector4(worldMatrix, [ center.x, center.y, center.z, 1 ]);
			centerTransformed = {
				x : centerTransformed[0],
				y : centerTransformed[1],
				z : centerTransformed[2]
			}
			this.zoomLookAtPoint(centerTransformed, 10000)
			orbit.pick({
				nodeId : SceneTree.getGid(oid),
				worldPos : [ centerTransformed.x, centerTransformed.y, centerTransformed.z ]
			});
		},
		changeTransparence : function(value) {
			this.transparenceValue = value;
			if (!this.globalCurrentOid) {
				this.globalCurrentOid = IfcTree.getRoot().ifcObject.object.oid;
			}
			this.showTransparentRecusively(IfcTree.getRoot(), this.globalCurrentOid, this.transparenceValue);// oid);
		},
		changeTranslation : function(value) {
			var node = IfcTree.getNode(this.globalCurrentOid);
			changeTranslationRecusively(node, value);
		},
		showLayer : function(layerName) {
			delete this.transparentLayers[layerName];
		},
		hideLayer : function(layerName) {
			this.transparentLayers[layerName] = true;
		},
		getNodeFromOid : function(node, oid) {
			if (oid === node.ifcObject.object.oid) {
				return node;
			}
			for (var i = 0; i < node.children.length; i++) {
				var child = this.getNodeFromOid(node.children[i], oid);
				if (child !== null) {
					return child;
				}
			}
			return null;
		},
		defaultView : function() {
			SceneTree.viewFromDefault();
		},
		sideView : function() {
			SceneTree.viewFromSide();
		},
		topView : function() {
			SceneTree.viewFromTop();
		},
		frontView : function() {
			SceneTree.viewFromFront();
		},
		showTransparentRecusively : function(node, oid, value) {
			if (oid === node.ifcObject.object.oid) {
				value = 1;
			}
			var currentOid = node.ifcObject.object.oid;
			var gid = SceneTree.getGid(currentOid);
			if (gid) {
				if (this.transparentLayers[node.ifcObject.object._t]) {
					value = (this.transparenceValue) ? this.transparenceValue : 0;
				}
				SceneTree.showTransparent(currentOid, gid, value);
			}
			for (var i = 0; i < node.children.length; i++) {
				this.showTransparentRecusively(node.children[i], oid, value);
			}
		},
		changeTranslationRecusively : function(node, value) {
			var currentOid = node.ifcObject.object.oid;
			var gid = SceneTree.getGid(currentOid);
			if (gid) {
				SceneTree.changeTranslationObject(gid, value);
			}
			for (var i = 0; i < node.children.length; i++) {
				changeTranslationRecusively(node.children[i], value);
			}
		},
		setZoomLevel : function(level) {
			SceneTree.zoom(level);
		},
		mouseDown : function(hit) {
			var timeInMs = Date.now();
			this.mouseDown = {
					time : timeInMs,
					screenX: hit.screenX,
					screenY: hit.screenY
			}
		},
		mouseUp : function(hit) {
			var me = this;
			if (equalsHits(hit, this.mouseDown) && (Date.now() - this.mouseDown.time) > 1000) {
				CMDBuild.bim.proxy.Bim.fetchCardFromViewewId({
					params : {
						revisionId : me.delegate.getCurrentRoid(),
						objectId : me.pickedOid 
					},

					success : function(fp, request, response) {
						if (response.card) {
							me.delegate.openCardDataWindow(response.card);
						}
						else {
							//console.log("! found");
						}
					}
				});
				
			}
		},
		pick : function(hit) {
			// Some plugins wrap things in this name to
			// avoid them being picked, such as skyboxes
			if (hit.name == "__SceneJS_dontPickMe") {
				return;
			}
			if (this.delegate) {
				this.pickedOid = SceneTree.getOid(hit.nodeId)
				this.delegate.selectGraphicNode(this.pickedOid);
			}
		},

		show : function(poid, type, observer) {
			var _this = this;
			this.delegate = observer;
			var bimServerUrl = CMDBuild.configuration.bim.get('url');
			var email = CMDBuild.configuration.bim.get('username');
			var password = CMDBuild.configuration.bim.get('password');
			var projectToShow = 2;
			trasparentView = false;
			var simpleSmallProject = null;
			var defaultModel = null;
			this.transparentLayers = {};
			var loadedOids = {};
			// Connect to the bim Server
			// load BimServer Api
			var api = null;
			api = new BimServerClient(bimServerUrl, null);
			api.init(function() {
				_this.bimServerApi = api;
				Global.bimServerApi = api;

				loginBimServer();

			});
			function loginBimServer() {
				CMDBuild.core.LoadMask.show();
				_this.bimServerApi.login(email, password, function() {

					Global.notifier = new Notifier();
					ProjectLoader.init(_this.bimServerApi);
					SceneTree.init(_this.bimServerApi, 'divBim3DView');
					resize();
					SceneTree.setUpViewer();
					ProjectLoader.showProject(poid, type, function(project, model) {
						$("#divBimIfcTree").empty();
						IfcTree.init(project);
						this.delegate.ifcTreeLoaded(IfcTree);
						SceneTree.getViewer().SYSTEM.events.register('mouseDown', this.mouseDown, this);
						SceneTree.getViewer().SYSTEM.events.register('mouseUp', this.mouseUp, this);
						SceneTree.getViewer().SYSTEM.events.register('pick', this.pick, this);

						displayInWebGL(model);
						CMDBuild.core.LoadMask.hide();
					}, _this);
				});
			}

			function displayInWebGL(model) {
				var ifcOidsArray = [];
				var ifcObjectArray = IfcTree.getIfcObjectArray();
				ifcObjectArray.forEach(function(ifcObject) {
					ifcOidsArray.push(ifcObject.oid);
				});
				var objectArray = [];
				var oldModeArray = [];

				ifcOidsArray.forEach(function(id) {
					model.get(id, function(object) {
						if (object != null) {
							var oldMode = object.trans.mode;
							object.trans.mode = 0;// mode;
							objectArray.push(object);
							oldModeArray.push(oldMode);
						}
					});
				});

				SceneTree.render3D(objectArray);
			}
			function resize() {
				SceneTree.resize($('div#divBim3DView').width(), $('div#divBim3DView').height());
			}

			function Notifier() {
				var lineBreak = "";

				this.setInfo = function(message) {
					$("#consoleP").append(message + lineBreak);
				}

				this.setSuccess = function(message) {
					$("#consoleP").append(message + lineBreak);
				}
			}

		}
	});
	function equalsHits(hit1, hit2) {
		var epsilon = 10;
		return (Math.abs(hit1.screenX - hit2.screenX) < epsilon && 
				Math.abs(hit1.screenX - hit2.screenX) < epsilon);
	}
//})();