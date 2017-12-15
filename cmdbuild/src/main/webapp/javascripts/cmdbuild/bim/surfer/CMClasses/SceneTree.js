var SceneTree = {
	viewer : undefined,
	oids2Gids : undefined,
	loadedOids : undefined,

	init : function(bimServerApi, htmlCanvas) {
		this.loadedOids = {};
		this.oids2Gids = {};
		this.viewer = new BIMSURFER.Viewer(bimServerApi, htmlCanvas);
		this.bimServerApi = bimServerApi;
	},
	getGid : function(oid) {
		return (this.oids2Gids[oid]) ? this.oids2Gids[oid].gid : null;
	},
	getOid : function(gid) {
		for ( var key in this.oids2Gids) {
			if (this.oids2Gids[key].gid === gid) {
				return key;
			}
		}
		return null;
	},
	setGid : function(oid, gid) {
		this.oids2Gids[oid] = {
			gid : gid
		};
	},
	getViewer : function() {
		return this.viewer;
	},
	setColor : function(oid, color) {
		this.oids2Gids[oid].color = color;
	},
	resize : function(w, h) {
		this.viewer.resize(w, h);
	},
	loadGeometry : function(geometryLoader) {
		this.viewer.loadGeometry(geometryLoader);
	},
	findNode : function(gid) {
		return this.viewer.scene.findNode(gid);
	},
	setUpViewer : function() {
		var me = this;
		this.viewer.loadScene(function() {

			var clickSelect = me.viewer.getControl("BIMSURFER.Control.ClickSelect");
			clickSelect.activate();
		});
	},
	_dumpScene : function(indent, node) {
		console.log(indent + node.type + " coreId = " + node.coreId + " id = " + node.id);
		for (var i = 0; i < node.nodes.length; i++) {
			this._dumpScene(indent + "---", node.nodes[i]);
		}
	},
	dumpScene : function() {
		this._dumpScene("", this.viewer.scene);
	},
	zoom : function(distance) {
		var lookUpObject = this.viewer.scene.findNode("main-lookAt");
		lookUpObject.setEye({
			x : 0,
			y : -distance,
			z : 0
		});
		this.dumpScene();
	},
	zoomLookAtPoint : function(point, distance, limits) {
		var lookUpObject = this.viewer.scene.findNode("main-lookAt");
		lookUpObject.setLook(point);
		lookUpObject.setEye({
			x : 0,
			y : -distance,
			z : 0
		});
	},
	changeTranslationObject : function(gid, value) {
		var sceneObject = this.viewer.scene.findNode(gid);
		sceneObject = sceneObject.findParentByType("flags");
		var matrixObj = this.getMatrix(sceneObject);
		if (matrixObj) {
			var matrixTranslation = SceneJS_math_translationMat4v([ 4000 * value, 0, 0, 0 ]);
			matrix = matrixObj.getModelMatrix();
			matrix = SceneJS_math_mulMat4(matrix, matrixTranslation);
			matrixObj.setMatrix(matrix);
		}
	},
	getMatrix : function(sceneObject) {
		if (!sceneObject) {
			return null;
		} else if (sceneObject.type === "matrix") {
			return sceneObject;
		}
		for (var i = 0; i < sceneObject.nodes.length; i++) {
			var ret = this.getMatrix(sceneObject.nodes[i]);
			if (ret) {
				return ret;
			}
		}
		return null;
	},
	viewFromDefault : function() {
		var bounds = this.viewer.modelBounds;
		var orbit = this.viewer.getControl("BIMSURFER.Control.PickFlyOrbit");
		orbit.restoreView(orbit.lookAtOrig);
	},
	viewFromFront : function() {
		var bounds = this.viewer.modelBounds;
		this.setOrbitEye({
			x : bounds.max.x * 3,
			y : 0,
			z : 0
		});
	},
	viewFromTop : function() {
		var bounds = this.viewer.modelBounds;
		this.setOrbitEye({
			x : 2,
			y : 0,
			z : bounds.max.z * 5
		});
	},
	viewFromFront : function() {
		var bounds = this.viewer.modelBounds;
		this.setOrbitEye({
			x : bounds.max.x * 3,
			y : 0,
			z : 0
		});
	},
	viewFromSide : function() {
		var bounds = this.viewer.modelBounds;
		this.setOrbitEye({
			x : 0,
			y : bounds.max.y * 3,
			z : 0
		});
	},
	setOrbitEye : function(eye) {
		var orbit = this.viewer.getControl("BIMSURFER.Control.PickFlyOrbit");
		orbit.lookAt.setLook({
			x : 0,
			y : 0,
			z : 0
		});
		orbit.lookAt.setEye(eye);
		var view = orbit.obtainView();
		orbit.restoreView(view);
	},
	showTransparent : function(oid, gid, value) {
		var sceneObject = this.viewer.scene.findNode(gid);
		if (! sceneObject) {
			return;
		}
		sceneObject.findParentByType("enable").setEnabled((value == 0 ) ? false : true);
		var flag = sceneObject.findParentByType("flags");
		if (!this.oids2Gids[oid].alpha) {
			this.oids2Gids[oid].alpha = sceneObject.parent.get("alpha");
		}
		flag.set("flags", {
			transparent : true
		});
		sceneObject.parent.set("alpha", value);
		var layer = sceneObject.findParentByType("layer");
		if (value < 1) {
			layer.setPriority(1);
			
		}
		else {
			layer.setPriority(-1);
		}
	},
	updateVisibility : function(object) {
		if (object.gid == null) {
			return;
		}
		this.setGid(object.oid, object.gid)
		var threeDObject = this.findNode(object.gid);
		var mode = object.trans.mode;
		if (threeDObject != null) {
			var matrix = threeDObject.nodes[0];
			var geometryNode = matrix.nodes[0];
			if (geometryNode != null) {
				if (mode == 0) {
					threeDObject.findParentByType("enable").setEnabled(true);
					if (geometryNode._core.arrays != null && geometryNode._core.arrays.colors != null) {
						if (object.trans.colorOverride != null) {
							this.setColor(object.oid, object.trans.colorOverride);
							this.changeColorOfObject(object, object.trans.colorOverride);
						} else {
							if (geometryNode.coreId != null && ("" + geometryNode.coreId).endsWith("_Visualization")) {
								// This is a complex-material object which had
								// been modified, return it to the old state
								if (geometryNode._core.arrays.colors != null) {
									matrix.removeNode(geometryNode);

									var newGeometry = {
										type : "geometry",
										coreId : geometryNode.getCoreId().replace("_Visualization", "")
									}

									matrix.addNode(newGeometry);
								}
							}
						}
					} else {
						if (object.trans.colorOverride != null) {
							this.changeColorOfObject(object, object.trans.colorOverride);
						} else {
							var material = BIMSURFER.Constants.materials[object.getType()];
							// Hack to get the roof to be red.....
							if (object.getType() == "IfcSlab") {
								if (object.getPredefinedType() == "ROOF") {
									material = BIMSURFER.Constants.materials["IfcRoof"];
								}
							}
							if (material == null) {
								material = BIMSURFER.Constants.materials.DEFAULT;
							}

							var color = {
								r : material.r,
								g : material.g,
								b : material.b,
								a : material.a
							};
							this.setColor(object.oid, color);
							this.changeColorOfObject(object, color);
						}
					}
				} else if (mode == 1) {
					threeDObject.findParentByType("enable").setEnabled(true);
					var color = {};
					color.a = 0.5;
					color.r = 0.5;
					color.g = 0.5;
					color.b = 0.5;
					if (_this.selectedId == object.oid) {
						threeDObject.getNode("highlight").set("alpha", 0.5);
					}
					this.changeColorOfObject(object, color);
				} else if (mode == 2) {
					threeDObject.findParentByType("enable").setEnabled(false);
				}
			}
		} else {
			console.log("Object not found: " + object.gid);
		}
	},
	changeColorOfObject : function(object, color) {
		var threeDObject = this.findNode(object.gid);
		if (threeDObject != null) {
			var matrix = threeDObject.nodes[0];
			var geometryNode = matrix.nodes[0];
			if (geometryNode._core.arrays != null && geometryNode._core.arrays.colors != null) {
				var groupId = threeDObject.findParentByType("translate").data.groupId;

				var geometry = {
					type : "geometry",
					primitive : "triangles"
				};
				geometry.coreId = geometryNode.getCoreId() + "_Visualization";
				geometry.indices = geometryNode._core.arrays.indices;
				geometry.positions = geometryNode._core.arrays.positions;
				geometry.normals = geometryNode._core.arrays.normals;

				geometry.colors = [];
				for (var i = 0; i < geometryNode._core.arrays.colors.length; i += 4) {
					geometry.colors[i] = color.r;
					geometry.colors[i + 1] = color.g;
					geometry.colors[i + 2] = color.b;
					geometry.colors[i + 3] = color.a;
				}

				var library = SceneTree.findNode("library-" + groupId);
				library.add("node", geometry);

				var newGeometry = {
					type : "geometry",
					coreId : geometryNode.getCoreId() + "_Visualization"
				}

				matrix.removeNode(geometryNode);
				matrix.addNode(newGeometry);
			} else {
				threeDObject.findParentByType("flags").set("flags", {
					transparent : color.a < 1
				});
				threeDObject.parent.set("alpha", color.a);
				threeDObject.parent.set("baseColor", {
					r : color.r,
					g : color.g,
					b : color.b
				});
			}
		}
	},
	render3D : function(objects) {
		// todo use groupid
		var uniqueRoids = [];
		var me = this;
		if (!Array.isArray(objects)) {
			objects = [ objects ];
		}

		var oidsNotLoaded = [];

		var count = 0;

		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			uniqueRoids.push(object.model.roid);

			this.updateVisibility(object);

			if (this.loadedOids[object.oid] == null) {
				if (object.isA("IfcProduct")) {
					if (object.object._rRepresentation != -1 && object.object._rRepresentation != null) {
						var projectModels = ProjectLoader.getProjectModels();

						projectModels[object.model.roid] = object.model;
						if (object.object._rgeometry != null) {
							if (object.model.objects[object.object._rgeometry] != null) {
								object.getGeometry(function(geometryInfo) {
									oidsNotLoaded.push({
										gid : object.object._rgeometry,
										oid : object.oid,
										object : object,
										info : geometryInfo.object
									});
									count++;
								});
							} else {
								oidsNotLoaded.push({
									gid : object.object._rgeometry,
									oid : object.oid,
									object : object
								});
								count++;
							}
						}
					}
				}
			}
		}
		oidsNotLoaded.sort(function(a, b) {
			if (a.info != null && b.info != null) {
				var topa = (a.info._emaxBounds.z + a.info._eminBounds.z) / 2;
				var topb = (b.info._emaxBounds.z + b.info._eminBounds.z) / 2;
				return topa - topb;
			} else {
				// Resort back to type
				// TODO this is dodgy when some objects do have info, and others
				// don't
				return a.object.getType().localeCompare(b.object.getType());
			}
		});
		if (count > 0) {
			var models = {};
			var lastModel;
			var projectModels = ProjectLoader.getProjectModels();
			uniqueRoids.forEach(function(roid) {
				models[roid] = projectModels[roid];
				lastModel = projectModels[roid];
			});
			// var geometryType = $.cookie(main.user.oid + "geometrytype");
			// if (geometryType == null) {
			geometryType = "triangles";
			// }
			var geometryLoader = new GeometryLoader(Global.bimServerApi, projectModels, this.getViewer(), geometryType);

			var first = true;
			var progressdiv = null;

			var progressbar = null;
			var text = null;

			geometryLoader.addProgressListener(function(title, progressPercent) {
				if (first) {
					var containerDiv = $("#divBim3DView");
					progressdiv = $("<div class=\"progressdiv\">");
					text = $("<div class=\"text\">");
					text.html("Blaat");
					var progress = $("<div class=\"progress progress-striped\">");
					progressbar = $("<div class=\"progress-bar\" style=\"width: 100%\">");
					progressdiv.append(text)
					progressdiv.append(progress);
					progress.append(progressbar);

					containerDiv.append(progressdiv);

					first = false;
				}
				// text.html("Loading... (" + nrObjectsRead + "/" +
				// totalNrObjects + ")");
				if (title == "done") {
					progressdiv.fadeOut(400);
				} else {
					text.html(title);
					progressbar.css("width", progressPercent + "%");
				}
			});

			geometryLoader.setLoadOids(uniqueRoids, oidsNotLoaded);
			geometryLoader.setTitle(text);

			// This might be needed when the geometryloader comes up with more
			// objects than requested...
			geometryLoader.objectAddedListeners.push(function(oid) {
				projectModels[uniqueRoids[0]].get(oid, function(object) {
					me.updateVisibility(object);
				});
				me.loadedOids[oid] = true;
			});
			this.loadGeometry(geometryLoader);
		}
	}
}
