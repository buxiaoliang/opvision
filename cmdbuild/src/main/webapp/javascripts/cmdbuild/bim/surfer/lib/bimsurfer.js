var BIMSURFER = {
	CLASS : "BIMSURFER",
	VERSION_NUMBER : "2.0 Dev"
};

/**
 * Constructor: BIMSURFER.Class Base class used to construct all other classes.
 * Includes support for multiple inheritance.
 */
BIMSURFER.Class = function(baseClass, subClass) {
	var constructor = null;
	var classObject = subClass || baseClass;

	if (typeof classObject.__construct == 'function') {
		constructor = classObject.__construct;
	} else if (typeof baseClass.prototype.__construct == 'function') {
		constructor = function() {
			baseClass.prototype.__construct.apply(this, arguments);
		}
	} else {
		constructor = function() {
		};
	}

	var Class = constructor;

	if (typeof subClass == 'undefined') {
		Class.prototype = classObject
	} else {
		var newClass = function() {
		};
		newClass.prototype = jQuery.extend({}, baseClass.prototype);
		jQuery.extend(newClass.prototype, subClass);
		Class.prototype = new newClass;
	}

	return Class;
};
"use strict"

/**
 * Class: BIMSURFER.Viewer The viewer can load and show the BIM Models.
 */
var GEOMETRY_TYPE_TRIANGLES = 0;
var GEOMETRY_TYPE_INSTANCE = 1;

BIMSURFER.Viewer = BIMSURFER
		.Class({
			CLASS : 'BIMSURFER.Viewer',
			SYSTEM : null,

			connectedServers : null,
			div : null,
			mode : null,
			canvas : null,
			events : null,
			controls : null,
			lights : null,
			scene : null,
			sceneLoaded : false,
			bimServerApi : null,
			activeGeometryLoaders : [],
			waitingGeometryLoaders : [],
			tick : 0,
			// selectedObj: 'emtpy Selection',
			// mouseRotate: 0,
			// oldZoom: 15,
			// autoLoadPath: "",

			/**
			 * @constructor
			 * @param {String|div
			 *            DOMelement} div The viewport div that will be used for
			 *            the canvas
			 * @param {Object}
			 *            [options] An object with options for controls and/or
			 *            lights
			 * @param {Boolean}
			 *            autoStart Full start automatically with the given
			 *            options (default = false)
			 */
			__construct : function(bimServerApi, div, options, autoStart) {
				this.bimServerApi = bimServerApi;
				if (typeof div == 'string') {
					div = jQuery('div#' + div)[0];
				}

				if (!jQuery(div).is('div')) {
					console.error('BIMSURFER: Can not find div element');
					return;
				}
				if (!BIMSURFER.Util.isset(options)) {
					options = {};
				}

				this.SYSTEM = this;
				this.div = div;
				this.events = new BIMSURFER.Events(this);
				this.connectedServers = new Array();
				this.controls = new Array();
				if (!BIMSURFER.Util.isset(options.controls)) {
					this.addControl(new BIMSURFER.Control.PickFlyOrbit()).activateWhenReady();
				} else if (BIMSURFER.Util.isArray(options.controls)) {
					for (var i = 0; i < options.controls.length; i++) {
						this.addControl(options.controls[i]).activateWhenReady();
					}
				}

				this.lights = new Array();
				if (typeof options.lights == 'undefined') {
					this.addLight(new BIMSURFER.Light.Sun());
					this.addLight(new BIMSURFER.Light.Ambient());
				} else if (BIMSURFER.Util.isArray(options.lights)) {
					for (var i = 0; i < options.lights.length; i++) {
						this.addLight(options.lights[i]);
					}
				}

				this.visibleTypes = new Array();

				if (BIMSURFER.Util.isset(options, options.autoStart)) {
					if (!BIMSURFER.Util.isset(options.autoStart.serverUrl, options.autoStart.serverUsername,
							options.autoStart.serverPassword, options.autoStart.projectOid)) {
						console.error('Some autostart parameters are missing');
						return;
					}
					var _this = this;
					var BIMServer = new BIMSURFER.Server(
							this,
							options.autoStart.serverUrl,
							options.autoStart.serverUsername,
							options.autoStart.serverPassword,
							false,
							true,
							true,
							function() {
								if (BIMServer.loginStatus != 'loggedin') {
									_this.div.innerHTML = 'Something went wrong while connecting';
									console.error('Something went wrong while connecting');
									return;
								}
								var project = BIMServer.getProjectByOid(options.autoStart.projectOid);
								project
										.loadScene(
												(BIMSURFER.Util.isset(options.autoStart.revisionOid) ? options.autoStart.revisionOid
														: null), true);
							});
				}
				setInterval(this.startNewLoaders, 200, this);
			},

			/**
			 * Stores a connection to a server for later use
			 * 
			 * @param {BIMSURFER.Server
			 *            instance} server The server connection to store
			 */
			addConnectedServer : function(server) {
				if (this.connectedServers.indexOf(server) == -1) {
					this.connectedServers.push(server);
				}
			},

			/**
			 * Adds a control to the viewer.
			 * 
			 * @param {BIMSURFER.Control.*
			 *            instance} control The control to add
			 * @return The control object
			 */
			addControl : function(control) {
				if (!BIMSURFER.Util.isset(this.controls[control.CLASS])) {
					this.controls[control.CLASS] = new Array();
				}

				if (this.controls[control.CLASS].indexOf(control) == -1) {
					this.controls[control.CLASS].push(control);
				}

				control.setViewer(this);
				return control;
			},

			/**
			 * Removes a control from the viewer
			 * 
			 * @param {BIMSURFER.Control.*
			 *            instance} control The controle to remove
			 * @return The control object
			 */
			removeControl : function(control) {
				if (BIMSURFER.Util.isArray(this.controls[control.CLASS])) {
					var i = this.controls[control.CLASS].indexOf(control);
					if (i != -1) {
						this.controls[control.CLASS].splice(i, 1);
						control.deactivate();
						control.removeFromViewer();
					}
				}
				return control;
			},

			getControl : function(type) {
				var controls = this.controls[type];
				if (controls.length > 0) {
					return controls[0];
				}
				return null;
			},

			/**
			 * Adds a light to the viewer
			 * 
			 * @param {BIMSURFER.Light.*
			 *            instance} light The light to add
			 * @return The light object
			 */
			addLight : function(light) {
				if (light.CLASS.substr(0, 16) != 'BIMSURFER.Light.') {
					return;
				}

				if (this.lights.indexOf(light) == -1) {
					this.lights.push(light);
				}
				light.setViewer(this);

				if (this.scene) {
					light.activate();
				}
				return light;
			},

			/**
			 * Resizes the viewport and updates the aspect ratio
			 * 
			 * @param {Number}
			 *            width The new width in px
			 * @param {Number}
			 *            height The new height in px
			 */
			resize : function(width, height) {
				if (this.canvas) {
					jQuery(this.canvas).width(width).height(height);
					if (BIMSURFER.Util.isset(this.canvas[0])) {
						this.canvas[0].width = width;
						this.canvas[0].height = height;
					}
				}

				if (this.scene !== null) {
					var optics = this.scene.findNode('main-camera').get('optics');
					optics['aspect'] = jQuery(this.canvas).width() / jQuery(this.canvas).height();
					this.scene.findNode('main-camera').set('optics', optics);
				}
			},

			/**
			 * Draws the HTML5 canvas element
			 * 
			 * @return The canvas element
			 */
			drawCanvas : function() {
				var width = jQuery(this.div).width();
				var height = jQuery(this.div).height();
				if (!(width > 0 && height > 0)) {
					return;
				}

				if (jQuery(this.canvas).length == 1) {
					jQuery(this.canvas).remove();
				}

				jQuery(this.div).empty();

				this.canvas = jQuery('<canvas />')
						.attr('id', jQuery(this.div).attr('id') + "-canvas")
						.attr('width', width)
						.attr('height', height)
						.html(
								'<p>This application requires a browser that supports the <a href="http://www.w3.org/html/wg/html5/">HTML5</a> &lt;canvas&gt; feature.</p>')
						.addClass(this.CLASS.replace(/\./g, "-")).appendTo(this.div);
				return this.canvas;
			},

			/**
			 * Initializes the common events of the viewer
			 */
			initEvents : function() {
				var _this = this;
				// TouchEmulator();

				var canvas = this.scene.getCanvas();
				// var hammer = new Hammer(canvas, { inputClass:
				// Hammer.TouchInput });
				//
				// hammer.on('pinch', function(e) {
				// _this.events.trigger('touchPinch', [e]);
				// });
				// hammer.get('pinch').set({ threshold: 0.1 });
				// hammer.get('pinch').set({ enable: true });
				//
				// hammer.on('pan', function(e) {
				// _this.events.trigger('touchPan', [e]);
				// });
				// hammer.get('pan').set({ pointers: 2 });

				canvas.addEventListener('mousedown', function(e) {
					_this.events.trigger('mouseDown', [ e ]);
				}, true);
				canvas.addEventListener('mousemove', function(e) {
					_this.events.trigger('mouseMove', [ e ]);
				}, true);
				canvas.addEventListener('mouseup', function(e) {
					_this.events.trigger('mouseUp', [ e ]);
				}, true);
				canvas.addEventListener('touchstart', function(e) {
					_this.events.trigger('touchStart', [ e ]);
				}, true);
				canvas.addEventListener('touchmove', function(e) {
					_this.events.trigger('touchMove', [ e ]);
				}, true);
				canvas.addEventListener('touchend', function(e) {
					_this.events.trigger('touchEnd', [ e ]);
				}, true);
				canvas.addEventListener('mousewheel', function(e) {
					_this.events.trigger('mouseWheel', [ e ]);
				}, true);
				canvas.addEventListener('DOMMouseScroll', function(e) {
					_this.events.trigger('mouseWheel', [ e ]);
				}, true);
				this.scene.on('pick', function(hit) {
					_this.events.trigger('pick', [ hit ]);
				});
				this.scene.on('tick', function() {
					_this.events.trigger('tick', []);
				});

				var lastDown = {
					x : null,
					y : null,
					scene : this.scene
				};
				this.events.register('mouseDown', function(e) {
					this.x = e.offsetX;
					this.y = e.offsetY;
				}, lastDown);
				this.events.register('mouseUp', function(e) {
					if (((e.offsetX > this.x) ? (e.offsetX - this.x < 5) : (this.x - e.offsetX < 5))
							&& ((e.offsetY > this.y) ? (e.offsetY - this.y < 5) : (this.y - e.offsetY < 5))) {
						this.scene.pick(this.x, this.y, {
							rayPick : true
						});
					}
				}, lastDown);
			},

			loadScene : function(callback, options) {
				SceneJS.reset();
				if (typeof options != 'object') {
					options = {};
				}

				if (this.scene == null) {
					try {
						var self = this;
						var CAPTURE_ID = "canvasCaptureNode";

						var addCaptureNode = function(nodes) {
							if (options.useCapture) {
								nodes.push({
									type : "canvas/capture",
									id : CAPTURE_ID
								});

							}
							return nodes;
						};
						this.scene = {
							backfaces : false,
							type : "scene",
							nodes : [ {
								type : 'lookAt',
								id : 'main-lookAt',
								eye : (typeof options.eye == 'object' ? options.eye : {
									x : 1,
									y : 1,
									z : 1
								}),
								look : (typeof options.look == 'object' ? options.look : {
									x : 0.0,
									y : 0.0,
									z : 0.0
								}),
								up : (typeof options.up == 'object' ? options.up : {
									x : 0.0,
									y : 0.0,
									z : 1.0
								}),
								nodes : [ {
									nodes : addCaptureNode([ {
										type : 'camera',
										id : 'main-camera',
										optics : {
											type : 'perspective',
											far : (typeof options.far == 'number' ? options.far : 100000),
											near : (typeof options.near == 'number' ? options.near : 0.001),
											aspect : (typeof options.aspect == 'number' ? options.aspect : jQuery(
													this.canvas).width()
													/ jQuery(this.canvas).height()),
											fovy : (typeof options.fovy == 'number' ? options.fovy : 37.8493)
										},
										nodes : [ {
											type : 'renderer',
											id : 'main-renderer',
											clear : {
												color : (typeof options.clearColor == 'boolean' ? options.clearColor
														: true),
												depth : (typeof options.clearDepth == 'boolean' ? options.clearDepth
														: true),
												stencil : (typeof options.clearStencil == 'boolean' ? options.clearStencil
														: true)
											},
											nodes : [ {
												type : 'lights',
												id : 'my-lights',
												lights : []
											} ]
										} ]
									} ])
								} ]
							} ]
						};

						this.drawCanvas();
						this.scene.canvasId = jQuery(this.canvas).attr('id');
						this.scene.id = this.scene.canvasId;
						this.scene = SceneJS.createScene(this.scene);

						var _this = this;

						if (options.useCapture) {
							this.scene.getNode(CAPTURE_ID, function(node) {
								var d;
								node.on("image", function(data) {
									d.resolve(data);
								});
								_this.capture = function(options) {
									d = jQuery.Deferred();
									node.capture({
										format : (options || {}).format || "png",
										width : (options || {}).width || 1024,
										height : (options || {}).height || 1024
									});
									return d;
								};
							});
						}

						this.scene.on("tick", function() {
							if (_this.tick % 5 == 0) {
								_this.activeGeometryLoaders.forEach(function(geometryLoader) {
									geometryLoader.process();
								});
							}
							_this.tick++;
						});

						for (var i = 0; i < this.lights.length; i++) {
							this.lights[i].activate();
						}

						var clickSelect = new BIMSURFER.Control.ClickSelect();
						this.addControl(clickSelect);

						if (this.scene != null) {
							// this.scene.set('tagMask', '^()$');

							this.initEvents();
							this.sceneLoaded = true;
						}
						callback();
					} catch (error) {
						console.error('loadScene: ', error, error.stack, this, arguments);
						console.debug('loadScene ERROR', error, error.stack, this, arguments);
					}
				} else {
					callback();
				}
				return null;
			},

			startNewLoaders : function(o) {
				if (o.waitingGeometryLoaders.length > 0 && o.activeGeometryLoaders.length < 3) {
					var geometryLoader = o.waitingGeometryLoaders[0];
					o.waitingGeometryLoaders = o.waitingGeometryLoaders.slice(1);
					o.activeGeometryLoaders.push(geometryLoader);
					geometryLoader.progressListeners.push(function(progress) {
						if (progress == "done") {
							o.tick = 0;
							removeA(o.activeGeometryLoaders, geometryLoader);
						}
					});
					geometryLoader.start();
				}
			},

			/**
			 * Loads and shows the geometry of the revisions that are in the
			 * load queue
			 */
			loadGeometry : function(geometryLoader) {
				var o = this;
				if (o.activeGeometryLoaders.length < 3) {
					o.activeGeometryLoaders.push(geometryLoader);
					geometryLoader.progressListeners.push(function(progress) {
						if (progress == "done") {
							o.tick = 0;
							removeA(o.activeGeometryLoaders, geometryLoader);
						}
					});
					geometryLoader.start();
				} else {
					o.waitingGeometryLoaders.push(geometryLoader);
				}
			},

			/**
			 * Hides an ifcType of a revision.
			 * 
			 * @param {String}
			 *            typeName The name of the type to hide
			 * @param {BIMSURFER.ProjectRevision
			 *            instance} revision The revision
			 */
			hideType : function(typeName, revision) {
				var i = revision.visibleTypes.indexOf(typeName.toLowerCase());
				if (i == -1) {
					return;
				}
				revision.visibleTypes.splice(i, 1);
				this.refreshMask();
			},

			/**
			 * Updates the mask filter of the viewer (shows/hides the ifcTypes)
			 */
			refreshMask : function() {
				var mask = new Array();

				this.visibleTypes.forEach(function(type) {
					mask.push(type);
				});

				var tagMask = '^(' + mask.join('|') + ')$';
				this.scene.set('tagMask', tagMask);
				this.events.trigger('tagMaskUpdated');
			},

			/**
			 * Hides all the types of a revision
			 * 
			 * @param {BIMSURFER.ProjectRevision}
			 *            revision The revision to hide
			 */
			hideRevision : function(revision) {
				var visibleTypes = revision.visibleTypes.slice(0);
				for (var i = 0; i < visibleTypes.length; i++) {
					this.hideType(visibleTypes[i], revision);
				}
			},

			/**
			 * Shows a revision
			 * 
			 * @param {BIMSURFER.ProjectRevision}
			 *            revision The revision to show
			 * @param {Array}
			 *            [types] The types to show (default =
			 *            BIMSURFER.Constants.defaultTypes)
			 */
			showRevision : function(revision, types) {
				if (!BIMSURFER.Util.isset(types)) {
					types = new Array();
					for (var i = 0; i < revision.ifcTypes.length; i++) {
						if (BIMSURFER.Constants.defaultTypes.indexOf(revision.ifcTypes[i]) != -1) {
							types.push(revision.ifcTypes[i]);
						}
					}
				}

				this.showType(types, revision);
			}
		});
if (typeof BIMSURFER.Util != 'object')
	BIMSURFER.Util = {};

BIMSURFER.Util.isset = function(variable) {
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == 'undefined' || arguments[i] == null) {
			return false;
		}
	}
	return true;
}
BIMSURFER.Util.isArray = function(variable) {
	return Object.prototype.toString.call(variable) === '[object Array]'
}

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}

/** *************************************************************************** */
/*
 * Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

if (!GLMAT_EPSILON) {
	var GLMAT_EPSILON = 0.000001;
}

if (!GLMAT_ARRAY_TYPE) {
	var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

if (!GLMAT_RANDOM) {
	var GLMAT_RANDOM = Math.random;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
BIMSURFER.Util.glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 * 
 * @param {Type}
 *            type Array type, such as Float32Array or Array
 */
BIMSURFER.Util.glMatrix.setMatrixArrayType = function(type) {
	GLMAT_ARRAY_TYPE = type;
}

/**
 * Convert Degree To Radian
 * 
 * @param {Number}
 *            Angle in Degrees
 */
BIMSURFER.Util.glMatrix.toRadian = function(a) {
	return a * (Math.PI / 180);
}

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */
BIMSURFER.Util.glMatrix.vec4 = {};

/**
 * Creates a new, empty vec4
 * 
 * @returns {vec4} a new 4D vector
 */
BIMSURFER.Util.glMatrix.vec4.create = function() {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 * 
 * @param {vec4}
 *            a vector to clone
 * @returns {vec4} a new 4D vector
 */
BIMSURFER.Util.glMatrix.vec4.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
};

/**
 * Creates a new vec4 initialized with the given values
 * 
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @param {Number}
 *            w W component
 * @returns {vec4} a new 4D vector
 */
BIMSURFER.Util.glMatrix.vec4.fromValues = function(x, y, z, w) {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
};

/**
 * Copy the values from one vec4 to another
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the source vector
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
};

/**
 * Set the components of a vec4 to the given values
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @param {Number}
 *            w W component
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.set = function(out, x, y, z, w) {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;
	return out;
};

/**
 * Adds two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.add = function(out, a, b) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	return out;
};

/**
 * Subtracts vector b from vector a
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.subtract = function(out, a, b) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.subtract}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.sub = BIMSURFER.Util.glMatrix.vec4.subtract;

/**
 * Multiplies two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.multiply = function(out, a, b) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	out[3] = a[3] * b[3];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.mul = BIMSURFER.Util.glMatrix.vec4.multiply;

/**
 * Divides two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.divide = function(out, a, b) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	out[3] = a[3] / b[3];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.divide}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.div = BIMSURFER.Util.glMatrix.vec4.divide;

/**
 * Returns the minimum of two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.min = function(out, a, b) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	out[3] = Math.min(a[3], b[3]);
	return out;
};

/**
 * Returns the maximum of two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.max = function(out, a, b) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	out[3] = Math.max(a[3], b[3]);
	return out;
};

/**
 * Scales a vec4 by a scalar number
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the vector to scale
 * @param {Number}
 *            b amount to scale the vector by
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.scale = function(out, a, b) {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	out[3] = a[3] * b;
	return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @param {Number}
 *            scale the amount to scale b by before adding
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.scaleAndAdd = function(out, a, b, scale) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	out[3] = a[3] + (b[3] * scale);
	return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 * 
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {Number} distance between a and b
 */
BIMSURFER.Util.glMatrix.vec4.distance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.distance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.dist = BIMSURFER.Util.glMatrix.vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 * 
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {Number} squared distance between a and b
 */
BIMSURFER.Util.glMatrix.vec4.squaredDistance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
	return x * x + y * y + z * z + w * w;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.squaredDistance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.sqrDist = BIMSURFER.Util.glMatrix.vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 * 
 * @param {vec4}
 *            a vector to calculate length of
 * @returns {Number} length of a
 */
BIMSURFER.Util.glMatrix.vec4.length = function(a) {
	var x = a[0], y = a[1], z = a[2], w = a[3];
	return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.length}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.len = BIMSURFER.Util.glMatrix.vec4.length;

/**
 * Calculates the squared length of a vec4
 * 
 * @param {vec4}
 *            a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
BIMSURFER.Util.glMatrix.vec4.squaredLength = function(a) {
	var x = a[0], y = a[1], z = a[2], w = a[3];
	return x * x + y * y + z * z + w * w;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec4.squaredLength}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.sqrLen = BIMSURFER.Util.glMatrix.vec4.squaredLength;

/**
 * Negates the components of a vec4
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a vector to negate
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.negate = function(out, a) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = -a[3];
	return out;
};

/**
 * Normalize a vec4
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a vector to normalize
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.normalize = function(out, a) {
	var x = a[0], y = a[1], z = a[2], w = a[3];
	var len = x * x + y * y + z * z + w * w;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
		out[0] = a[0] * len;
		out[1] = a[1] * len;
		out[2] = a[2] * len;
		out[3] = a[3] * len;
	}
	return out;
};

/**
 * Calculates the dot product of two vec4's
 * 
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @returns {Number} dot product of a and b
 */
BIMSURFER.Util.glMatrix.vec4.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the first operand
 * @param {vec4}
 *            b the second operand
 * @param {Number}
 *            t interpolation amount between the two inputs
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.lerp = function(out, a, b, t) {
	var ax = a[0], ay = a[1], az = a[2], aw = a[3];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	out[3] = aw + t * (b[3] - aw);
	return out;
};

/**
 * Generates a random vector with the given scale
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {Number}
 *            [scale] Length of the resulting vector. If ommitted, a unit vector
 *            will be returned
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.random = function(out, scale) {
	scale = scale || 1.0;

	// TODO: This is a pretty awful way of doing this. Find something better.
	out[0] = GLMAT_RANDOM();
	out[1] = GLMAT_RANDOM();
	out[2] = GLMAT_RANDOM();
	out[3] = GLMAT_RANDOM();
	BIMSURFER.Util.glMatrix.vec4.normalize(out, out);
	BIMSURFER.Util.glMatrix.vec4.scale(out, out, scale);
	return out;
};

/**
 * Transforms the vec4 with a BIMSURFER.Util.glMatrix.mat4.
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the vector to transform
 * @param {mat4}
 *            m matrix to transform with
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.transformMat4 = function(out, a, m) {
	var x = a[0], y = a[1], z = a[2], w = a[3];
	out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	return out;
};

/**
 * Transforms the vec4 with a quat
 * 
 * @param {vec4}
 *            out the receiving vector
 * @param {vec4}
 *            a the vector to transform
 * @param {quat}
 *            q quaternion to transform with
 * @returns {vec4} out
 */
BIMSURFER.Util.glMatrix.vec4.transformQuat = function(out, a, q) {
	var x = a[0], y = a[1], z = a[2], qx = q[0], qy = q[1], qz = q[2], qw = q[3],

	// calculate quat * vec
	ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y
			- qz * z;

	// calculate result * inverse quat
	out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	return out;
};

/**
 * Perform some operation over an array of vec4s.
 * 
 * @param {Array}
 *            a the array of vectors to iterate over
 * @param {Number}
 *            stride Number of elements between the start of each
 *            BIMSURFER.Util.glMatrix.vec4. If 0 assumes tightly packed
 * @param {Number}
 *            offset Number of elements to skip at the beginning of the array
 * @param {Number}
 *            count Number of vec2s to iterate over. If 0 iterates over entire
 *            array
 * @param {Function}
 *            fn Function to call for each vector in the array
 * @param {Object}
 *            [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
BIMSURFER.Util.glMatrix.vec4.forEach = (function() {
	var vec = BIMSURFER.Util.glMatrix.vec4.create();

	return function(a, stride, offset, count, fn, arg) {
		var i, l;
		if (!stride) {
			stride = 4;
		}

		if (!offset) {
			offset = 0;
		}

		if (count) {
			l = Math.min((count * stride) + offset, a.length);
		} else {
			l = a.length;
		}

		for (i = offset; i < l; i += stride) {
			vec[0] = a[i];
			vec[1] = a[i + 1];
			vec[2] = a[i + 2];
			vec[3] = a[i + 3];
			fn(vec, vec, arg);
			a[i] = vec[0];
			a[i + 1] = vec[1];
			a[i + 2] = vec[2];
			a[i + 3] = vec[3];
		}

		return a;
	};
})();

/**
 * Returns a string representation of a vector
 * 
 * @param {vec4}
 *            vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
BIMSURFER.Util.glMatrix.vec4.str = function(a) {
	return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
BIMSURFER.Util.glMatrix.vec3 = {};

/**
 * Creates a new, empty vec3
 * 
 * @returns {vec3} a new 3D vector
 */
BIMSURFER.Util.glMatrix.vec3.create = function() {
	var out = new GLMAT_ARRAY_TYPE(3);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 * 
 * @param {vec3}
 *            a vector to clone
 * @returns {vec3} a new 3D vector
 */
BIMSURFER.Util.glMatrix.vec3.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(3);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
};

/**
 * Creates a new vec3 initialized with the given values
 * 
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @returns {vec3} a new 3D vector
 */
BIMSURFER.Util.glMatrix.vec3.fromValues = function(x, y, z) {
	var out = new GLMAT_ARRAY_TYPE(3);
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
};

/**
 * Copy the values from one vec3 to another
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the source vector
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	return out;
};

/**
 * Set the components of a vec3 to the given values
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.set = function(out, x, y, z) {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	return out;
};

/**
 * Adds two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.add = function(out, a, b) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	return out;
};

/**
 * Subtracts vector b from vector a
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.subtract = function(out, a, b) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.subtract}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.sub = BIMSURFER.Util.glMatrix.vec3.subtract;

/**
 * Multiplies two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.multiply = function(out, a, b) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.mul = BIMSURFER.Util.glMatrix.vec3.multiply;

/**
 * Divides two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.divide = function(out, a, b) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.divide}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.div = BIMSURFER.Util.glMatrix.vec3.divide;

/**
 * Returns the minimum of two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.min = function(out, a, b) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	return out;
};

/**
 * Returns the maximum of two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.max = function(out, a, b) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	return out;
};

/**
 * Scales a vec3 by a scalar number
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the vector to scale
 * @param {Number}
 *            b amount to scale the vector by
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.scale = function(out, a, b) {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @param {Number}
 *            scale the amount to scale b by before adding
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.scaleAndAdd = function(out, a, b, scale) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 * 
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {Number} distance between a and b
 */
BIMSURFER.Util.glMatrix.vec3.distance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
	return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.distance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.dist = BIMSURFER.Util.glMatrix.vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 * 
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {Number} squared distance between a and b
 */
BIMSURFER.Util.glMatrix.vec3.squaredDistance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
	return x * x + y * y + z * z;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.squaredDistance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.sqrDist = BIMSURFER.Util.glMatrix.vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 * 
 * @param {vec3}
 *            a vector to calculate length of
 * @returns {Number} length of a
 */
BIMSURFER.Util.glMatrix.vec3.length = function(a) {
	var x = a[0], y = a[1], z = a[2];
	return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.length}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.len = BIMSURFER.Util.glMatrix.vec3.length;

/**
 * Calculates the squared length of a vec3
 * 
 * @param {vec3}
 *            a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
BIMSURFER.Util.glMatrix.vec3.squaredLength = function(a) {
	var x = a[0], y = a[1], z = a[2];
	return x * x + y * y + z * z;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec3.squaredLength}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.sqrLen = BIMSURFER.Util.glMatrix.vec3.squaredLength;

/**
 * Negates the components of a vec3
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a vector to negate
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.negate = function(out, a) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	return out;
};

/**
 * Normalize a vec3
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a vector to normalize
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.normalize = function(out, a) {
	var x = a[0], y = a[1], z = a[2];
	var len = x * x + y * y + z * z;
	if (len > 0) {
		// TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt(len);
		out[0] = a[0] * len;
		out[1] = a[1] * len;
		out[2] = a[2] * len;
	}
	return out;
};

/**
 * Calculates the dot product of two vec3's
 * 
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {Number} dot product of a and b
 */
BIMSURFER.Util.glMatrix.vec3.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.cross = function(out, a, b) {
	var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];

	out[0] = ay * bz - az * by;
	out[1] = az * bx - ax * bz;
	out[2] = ax * by - ay * bx;
	return out;
};

/**
 * Performs a linear interpolation between two vec3's
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the first operand
 * @param {vec3}
 *            b the second operand
 * @param {Number}
 *            t interpolation amount between the two inputs
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.lerp = function(out, a, b, t) {
	var ax = a[0], ay = a[1], az = a[2];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	return out;
};

/**
 * Generates a random vector with the given scale
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {Number}
 *            [scale] Length of the resulting vector. If ommitted, a unit vector
 *            will be returned
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.random = function(out, scale) {
	scale = scale || 1.0;

	var r = GLMAT_RANDOM() * 2.0 * Math.PI;
	var z = (GLMAT_RANDOM() * 2.0) - 1.0;
	var zScale = Math.sqrt(1.0 - z * z) * scale;

	out[0] = Math.cos(r) * zScale;
	out[1] = Math.sin(r) * zScale;
	out[2] = z * scale;
	return out;
};

/**
 * Transforms the vec3 with a BIMSURFER.Util.glMatrix.mat4. 4th vector component
 * is implicitly '1'
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the vector to transform
 * @param {mat4}
 *            m matrix to transform with
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.transformMat4 = function(out, a, m) {
	var x = a[0], y = a[1], z = a[2];
	out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
	out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
	out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
	return out;
};

/**
 * Transforms the vec3 with a BIMSURFER.Util.glMatrix.mat3.
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the vector to transform
 * @param {mat4}
 *            m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.transformMat3 = function(out, a, m) {
	var x = a[0], y = a[1], z = a[2];
	out[0] = x * m[0] + y * m[3] + z * m[6];
	out[1] = x * m[1] + y * m[4] + z * m[7];
	out[2] = x * m[2] + y * m[5] + z * m[8];
	return out;
};

/**
 * Transforms the vec3 with a quat
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec3}
 *            a the vector to transform
 * @param {quat}
 *            q quaternion to transform with
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec3.transformQuat = function(out, a, q) {
	// benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

	var x = a[0], y = a[1], z = a[2], qx = q[0], qy = q[1], qz = q[2], qw = q[3],

	// calculate quat * vec
	ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y
			- qz * z;

	// calculate result * inverse quat
	out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	return out;
};

/**
 * Perform some operation over an array of vec3s.
 * 
 * @param {Array}
 *            a the array of vectors to iterate over
 * @param {Number}
 *            stride Number of elements between the start of each
 *            BIMSURFER.Util.glMatrix.vec3. If 0 assumes tightly packed
 * @param {Number}
 *            offset Number of elements to skip at the beginning of the array
 * @param {Number}
 *            count Number of vec3s to iterate over. If 0 iterates over entire
 *            array
 * @param {Function}
 *            fn Function to call for each vector in the array
 * @param {Object}
 *            [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
BIMSURFER.Util.glMatrix.vec3.forEach = (function() {
	var vec = BIMSURFER.Util.glMatrix.vec3.create();

	return function(a, stride, offset, count, fn, arg) {
		var i, l;
		if (!stride) {
			stride = 3;
		}

		if (!offset) {
			offset = 0;
		}

		if (count) {
			l = Math.min((count * stride) + offset, a.length);
		} else {
			l = a.length;
		}

		for (i = offset; i < l; i += stride) {
			vec[0] = a[i];
			vec[1] = a[i + 1];
			vec[2] = a[i + 2];
			fn(vec, vec, arg);
			a[i] = vec[0];
			a[i + 1] = vec[1];
			a[i + 2] = vec[2];
		}

		return a;
	};
})();

/**
 * Returns a string representation of a vector
 * 
 * @param {vec3}
 *            vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
BIMSURFER.Util.glMatrix.vec3.str = function(a) {
	return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
BIMSURFER.Util.glMatrix.vec2 = {};

/**
 * Creates a new, empty vec2
 * 
 * @returns {vec2} a new 2D vector
 */
BIMSURFER.Util.glMatrix.vec2.create = function() {
	var out = new GLMAT_ARRAY_TYPE(2);
	out[0] = 0;
	out[1] = 0;
	return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 * 
 * @param {vec2}
 *            a vector to clone
 * @returns {vec2} a new 2D vector
 */
BIMSURFER.Util.glMatrix.vec2.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(2);
	out[0] = a[0];
	out[1] = a[1];
	return out;
};

/**
 * Creates a new vec2 initialized with the given values
 * 
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @returns {vec2} a new 2D vector
 */
BIMSURFER.Util.glMatrix.vec2.fromValues = function(x, y) {
	var out = new GLMAT_ARRAY_TYPE(2);
	out[0] = x;
	out[1] = y;
	return out;
};

/**
 * Copy the values from one vec2 to another
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the source vector
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	return out;
};

/**
 * Set the components of a vec2 to the given values
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.set = function(out, x, y) {
	out[0] = x;
	out[1] = y;
	return out;
};

/**
 * Adds two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.add = function(out, a, b) {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	return out;
};

/**
 * Subtracts vector b from vector a
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.subtract = function(out, a, b) {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.subtract}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.sub = BIMSURFER.Util.glMatrix.vec2.subtract;

/**
 * Multiplies two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.multiply = function(out, a, b) {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.mul = BIMSURFER.Util.glMatrix.vec2.multiply;

/**
 * Divides two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.divide = function(out, a, b) {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.divide}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.div = BIMSURFER.Util.glMatrix.vec2.divide;

/**
 * Returns the minimum of two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.min = function(out, a, b) {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	return out;
};

/**
 * Returns the maximum of two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.max = function(out, a, b) {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	return out;
};

/**
 * Scales a vec2 by a scalar number
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the vector to scale
 * @param {Number}
 *            b amount to scale the vector by
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.scale = function(out, a, b) {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @param {Number}
 *            scale the amount to scale b by before adding
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.scaleAndAdd = function(out, a, b, scale) {
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 * 
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {Number} distance between a and b
 */
BIMSURFER.Util.glMatrix.vec2.distance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1];
	return Math.sqrt(x * x + y * y);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.distance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.dist = BIMSURFER.Util.glMatrix.vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 * 
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {Number} squared distance between a and b
 */
BIMSURFER.Util.glMatrix.vec2.squaredDistance = function(a, b) {
	var x = b[0] - a[0], y = b[1] - a[1];
	return x * x + y * y;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.squaredDistance}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.sqrDist = BIMSURFER.Util.glMatrix.vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 * 
 * @param {vec2}
 *            a vector to calculate length of
 * @returns {Number} length of a
 */
BIMSURFER.Util.glMatrix.vec2.length = function(a) {
	var x = a[0], y = a[1];
	return Math.sqrt(x * x + y * y);
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.length}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.len = BIMSURFER.Util.glMatrix.vec2.length;

/**
 * Calculates the squared length of a vec2
 * 
 * @param {vec2}
 *            a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
BIMSURFER.Util.glMatrix.vec2.squaredLength = function(a) {
	var x = a[0], y = a[1];
	return x * x + y * y;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.vec2.squaredLength}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.sqrLen = BIMSURFER.Util.glMatrix.vec2.squaredLength;

/**
 * Negates the components of a vec2
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a vector to negate
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.negate = function(out, a) {
	out[0] = -a[0];
	out[1] = -a[1];
	return out;
};

/**
 * Normalize a vec2
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a vector to normalize
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.normalize = function(out, a) {
	var x = a[0], y = a[1];
	var len = x * x + y * y;
	if (len > 0) {
		// TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt(len);
		out[0] = a[0] * len;
		out[1] = a[1] * len;
	}
	return out;
};

/**
 * Calculates the dot product of two vec2's
 * 
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {Number} dot product of a and b
 */
BIMSURFER.Util.glMatrix.vec2.dot = function(a, b) {
	return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's Note that the cross product must by
 * definition produce a 3D vector
 * 
 * @param {vec3}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @returns {vec3} out
 */
BIMSURFER.Util.glMatrix.vec2.cross = function(out, a, b) {
	var z = a[0] * b[1] - a[1] * b[0];
	out[0] = out[1] = 0;
	out[2] = z;
	return out;
};

/**
 * Performs a linear interpolation between two vec2's
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the first operand
 * @param {vec2}
 *            b the second operand
 * @param {Number}
 *            t interpolation amount between the two inputs
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.lerp = function(out, a, b, t) {
	var ax = a[0], ay = a[1];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	return out;
};

/**
 * Generates a random vector with the given scale
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {Number}
 *            [scale] Length of the resulting vector. If ommitted, a unit vector
 *            will be returned
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.random = function(out, scale) {
	scale = scale || 1.0;
	var r = GLMAT_RANDOM() * 2.0 * Math.PI;
	out[0] = Math.cos(r) * scale;
	out[1] = Math.sin(r) * scale;
	return out;
};

/**
 * Transforms the vec2 with a mat2
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the vector to transform
 * @param {mat2}
 *            m matrix to transform with
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.transformMat2 = function(out, a, m) {
	var x = a[0], y = a[1];
	out[0] = m[0] * x + m[2] * y;
	out[1] = m[1] * x + m[3] * y;
	return out;
};

/**
 * Transforms the vec2 with a mat2d
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the vector to transform
 * @param {mat2d}
 *            m matrix to transform with
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.transformMat2d = function(out, a, m) {
	var x = a[0], y = a[1];
	out[0] = m[0] * x + m[2] * y + m[4];
	out[1] = m[1] * x + m[3] * y + m[5];
	return out;
};

/**
 * Transforms the vec2 with a mat3 3rd vector component is implicitly '1'
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the vector to transform
 * @param {mat3}
 *            m matrix to transform with
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.transformMat3 = function(out, a, m) {
	var x = a[0], y = a[1];
	out[0] = m[0] * x + m[3] * y + m[6];
	out[1] = m[1] * x + m[4] * y + m[7];
	return out;
};

/**
 * Transforms the vec2 with a mat4 3rd vector component is implicitly '0' 4th
 * vector component is implicitly '1'
 * 
 * @param {vec2}
 *            out the receiving vector
 * @param {vec2}
 *            a the vector to transform
 * @param {mat4}
 *            m matrix to transform with
 * @returns {vec2} out
 */
BIMSURFER.Util.glMatrix.vec2.transformMat4 = function(out, a, m) {
	var x = a[0], y = a[1];
	out[0] = m[0] * x + m[4] * y + m[12];
	out[1] = m[1] * x + m[5] * y + m[13];
	return out;
};

/**
 * Perform some operation over an array of vec2s.
 * 
 * @param {Array}
 *            a the array of vectors to iterate over
 * @param {Number}
 *            stride Number of elements between the start of each
 *            BIMSURFER.Util.glMatrix.vec2. If 0 assumes tightly packed
 * @param {Number}
 *            offset Number of elements to skip at the beginning of the array
 * @param {Number}
 *            count Number of vec2s to iterate over. If 0 iterates over entire
 *            array
 * @param {Function}
 *            fn Function to call for each vector in the array
 * @param {Object}
 *            [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
BIMSURFER.Util.glMatrix.vec2.forEach = (function() {
	var vec = BIMSURFER.Util.glMatrix.vec2.create();

	return function(a, stride, offset, count, fn, arg) {
		var i, l;
		if (!stride) {
			stride = 2;
		}

		if (!offset) {
			offset = 0;
		}

		if (count) {
			l = Math.min((count * stride) + offset, a.length);
		} else {
			l = a.length;
		}

		for (i = offset; i < l; i += stride) {
			vec[0] = a[i];
			vec[1] = a[i + 1];
			fn(vec, vec, arg);
			a[i] = vec[0];
			a[i + 1] = vec[1];
		}

		return a;
	};
})();

/**
 * Returns a string representation of a vector
 * 
 * @param {vec2}
 *            vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
BIMSURFER.Util.glMatrix.vec2.str = function(a) {
	return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/**
 * @class 4x4 Matrix
 * @name mat4
 */
BIMSURFER.Util.glMatrix.mat4 = {};

/**
 * Creates a new identity mat4
 * 
 * @returns {mat4} a new 4x4 matrix
 */
BIMSURFER.Util.glMatrix.mat4.create = function() {
	var out = new GLMAT_ARRAY_TYPE(16);
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 * 
 * @param {mat4}
 *            a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
BIMSURFER.Util.glMatrix.mat4.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(16);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	out[9] = a[9];
	out[10] = a[10];
	out[11] = a[11];
	out[12] = a[12];
	out[13] = a[13];
	out[14] = a[14];
	out[15] = a[15];
	return out;
};

/**
 * Copy the values from one mat4 to another
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the source matrix
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	out[9] = a[9];
	out[10] = a[10];
	out[11] = a[11];
	out[12] = a[12];
	out[13] = a[13];
	out[14] = a[14];
	out[15] = a[15];
	return out;
};

/**
 * Set a mat4 to the identity matrix
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.identity = function(out) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = 1;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 1;
	out[11] = 0;
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
	return out;
};

/**
 * Transpose the values of a mat4
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the source matrix
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.transpose = function(out, a) {
	// If we are transposing ourselves we can skip a few steps but have to cache
	// some values
	if (out === a) {
		var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];

		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a01;
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a02;
		out[9] = a12;
		out[11] = a[14];
		out[12] = a03;
		out[13] = a13;
		out[14] = a23;
	} else {
		out[0] = a[0];
		out[1] = a[4];
		out[2] = a[8];
		out[3] = a[12];
		out[4] = a[1];
		out[5] = a[5];
		out[6] = a[9];
		out[7] = a[13];
		out[8] = a[2];
		out[9] = a[6];
		out[10] = a[10];
		out[11] = a[14];
		out[12] = a[3];
		out[13] = a[7];
		out[14] = a[11];
		out[15] = a[15];
	}

	return out;
};

/**
 * Inverts a mat4
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the source matrix
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.invert = function(out, a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01
			* a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20
			* a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,

	// Calculate the determinant
	det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	return out;
};

/**
 * Calculates the adjugate of a mat4
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the source matrix
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.adjoint = function(out, a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	return out;
};

/**
 * Calculates the determinant of a mat4
 * 
 * @param {mat4}
 *            a the source matrix
 * @returns {Number} determinant of a
 */
BIMSURFER.Util.glMatrix.mat4.determinant = function(a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01
			* a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20
			* a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;

	// Calculate the determinant
	return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the first operand
 * @param {mat4}
 *            b the second operand
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.multiply = function(out, a, b) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	// Cache only the current line of the second matrix
	var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.mat4.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.mat4.mul = BIMSURFER.Util.glMatrix.mat4.multiply;

/**
 * Translate a mat4 by the given vector
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to translate
 * @param {vec3}
 *            v vector to translate by
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.translate = function(out, a, v) {
	var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;

	if (a === out) {
		out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
		out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
		out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
		out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	} else {
		a00 = a[0];
		a01 = a[1];
		a02 = a[2];
		a03 = a[3];
		a10 = a[4];
		a11 = a[5];
		a12 = a[6];
		a13 = a[7];
		a20 = a[8];
		a21 = a[9];
		a22 = a[10];
		a23 = a[11];

		out[0] = a00;
		out[1] = a01;
		out[2] = a02;
		out[3] = a03;
		out[4] = a10;
		out[5] = a11;
		out[6] = a12;
		out[7] = a13;
		out[8] = a20;
		out[9] = a21;
		out[10] = a22;
		out[11] = a23;

		out[12] = a00 * x + a10 * y + a20 * z + a[12];
		out[13] = a01 * x + a11 * y + a21 * z + a[13];
		out[14] = a02 * x + a12 * y + a22 * z + a[14];
		out[15] = a03 * x + a13 * y + a23 * z + a[15];
	}

	return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to scale
 * @param {vec3}
 *            v the vec3 to scale the matrix by
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.scale = function(out, a, v) {
	var x = v[0], y = v[1], z = v[2];

	out[0] = a[0] * x;
	out[1] = a[1] * x;
	out[2] = a[2] * x;
	out[3] = a[3] * x;
	out[4] = a[4] * y;
	out[5] = a[5] * y;
	out[6] = a[6] * y;
	out[7] = a[7] * y;
	out[8] = a[8] * z;
	out[9] = a[9] * z;
	out[10] = a[10] * z;
	out[11] = a[11] * z;
	out[12] = a[12];
	out[13] = a[13];
	out[14] = a[14];
	out[15] = a[15];
	return out;
};

/**
 * Rotates a mat4 by the given angle
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @param {vec3}
 *            axis the axis to rotate around
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.rotate = function(out, a, rad, axis) {
	var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;

	if (Math.abs(len) < GLMAT_EPSILON) {
		return null;
	}

	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;

	s = Math.sin(rad);
	c = Math.cos(rad);
	t = 1 - c;

	a00 = a[0];
	a01 = a[1];
	a02 = a[2];
	a03 = a[3];
	a10 = a[4];
	a11 = a[5];
	a12 = a[6];
	a13 = a[7];
	a20 = a[8];
	a21 = a[9];
	a22 = a[10];
	a23 = a[11];

	// Construct the elements of the rotation matrix
	b00 = x * x * t + c;
	b01 = y * x * t + z * s;
	b02 = z * x * t - y * s;
	b10 = x * y * t - z * s;
	b11 = y * y * t + c;
	b12 = z * y * t + x * s;
	b20 = x * z * t + y * s;
	b21 = y * z * t - x * s;
	b22 = z * z * t + c;

	// Perform rotation-specific matrix multiplication
	out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	out[11] = a03 * b20 + a13 * b21 + a23 * b22;

	if (a !== out) { // If the source and destination differ, copy the
		// unchanged last row
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}
	return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.rotateX = function(out, a, rad) {
	var s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

	if (a !== out) { // If the source and destination differ, copy the
		// unchanged rows
		out[0] = a[0];
		out[1] = a[1];
		out[2] = a[2];
		out[3] = a[3];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[4] = a10 * c + a20 * s;
	out[5] = a11 * c + a21 * s;
	out[6] = a12 * c + a22 * s;
	out[7] = a13 * c + a23 * s;
	out[8] = a20 * c - a10 * s;
	out[9] = a21 * c - a11 * s;
	out[10] = a22 * c - a12 * s;
	out[11] = a23 * c - a13 * s;
	return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.rotateY = function(out, a, rad) {
	var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

	if (a !== out) { // If the source and destination differ, copy the
		// unchanged rows
		out[4] = a[4];
		out[5] = a[5];
		out[6] = a[6];
		out[7] = a[7];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[0] = a00 * c - a20 * s;
	out[1] = a01 * c - a21 * s;
	out[2] = a02 * c - a22 * s;
	out[3] = a03 * c - a23 * s;
	out[8] = a00 * s + a20 * c;
	out[9] = a01 * s + a21 * c;
	out[10] = a02 * s + a22 * c;
	out[11] = a03 * s + a23 * c;
	return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 * 
 * @param {mat4}
 *            out the receiving matrix
 * @param {mat4}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.rotateZ = function(out, a, rad) {
	var s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];

	if (a !== out) { // If the source and destination differ, copy the
		// unchanged last row
		out[8] = a[8];
		out[9] = a[9];
		out[10] = a[10];
		out[11] = a[11];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
	}

	// Perform axis-specific matrix multiplication
	out[0] = a00 * c + a10 * s;
	out[1] = a01 * c + a11 * s;
	out[2] = a02 * c + a12 * s;
	out[3] = a03 * c + a13 * s;
	out[4] = a10 * c - a00 * s;
	out[5] = a11 * c - a01 * s;
	out[6] = a12 * c - a02 * s;
	out[7] = a13 * c - a03 * s;
	return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation This is
 * equivalent to (but much faster than):
 * 
 * BIMSURFER.Util.glMatrix.mat4.identity(dest);
 * BIMSURFER.Util.glMatrix.mat4.translate(dest, vec); var quatMat =
 * BIMSURFER.Util.glMatrix.mat4.create(); quat4.toMat4(quat, quatMat);
 * BIMSURFER.Util.glMatrix.mat4.multiply(dest, quatMat);
 * 
 * @param {mat4}
 *            out mat4 receiving operation result
 * @param {quat4}
 *            q Rotation quaternion
 * @param {vec3}
 *            v Translation vector
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.fromRotationTranslation = function(out, q, v) {
	// Quaternion math
	var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z,

	xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;

	out[0] = 1 - (yy + zz);
	out[1] = xy + wz;
	out[2] = xz - wy;
	out[3] = 0;
	out[4] = xy - wz;
	out[5] = 1 - (xx + zz);
	out[6] = yz + wx;
	out[7] = 0;
	out[8] = xz + wy;
	out[9] = yz - wx;
	out[10] = 1 - (xx + yy);
	out[11] = 0;
	out[12] = v[0];
	out[13] = v[1];
	out[14] = v[2];
	out[15] = 1;

	return out;
};

/**
 * Calculates a 4x4 matrix from the given quaternion
 * 
 * @param {mat4}
 *            out mat4 receiving operation result
 * @param {quat}
 *            q Quaternion to create matrix from
 * 
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.fromQuat = function(out, q) {
	var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z,

	xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;

	out[0] = 1 - (yy + zz);
	out[1] = xy + wz;
	out[2] = xz - wy;
	out[3] = 0;

	out[4] = xy - wz;
	out[5] = 1 - (xx + zz);
	out[6] = yz + wx;
	out[7] = 0;

	out[8] = xz + wy;
	out[9] = yz - wx;
	out[10] = 1 - (xx + yy);
	out[11] = 0;

	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;

	return out;
};

/**
 * Generates a frustum matrix with the given bounds
 * 
 * @param {mat4}
 *            out mat4 frustum matrix will be written into
 * @param {Number}
 *            left Left bound of the frustum
 * @param {Number}
 *            right Right bound of the frustum
 * @param {Number}
 *            bottom Bottom bound of the frustum
 * @param {Number}
 *            top Top bound of the frustum
 * @param {Number}
 *            near Near bound of the frustum
 * @param {Number}
 *            far Far bound of the frustum
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.frustum = function(out, left, right, bottom, top, near, far) {
	var rl = 1 / (right - left), tb = 1 / (top - bottom), nf = 1 / (near - far);
	out[0] = (near * 2) * rl;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = (near * 2) * tb;
	out[6] = 0;
	out[7] = 0;
	out[8] = (right + left) * rl;
	out[9] = (top + bottom) * tb;
	out[10] = (far + near) * nf;
	out[11] = -1;
	out[12] = 0;
	out[13] = 0;
	out[14] = (far * near * 2) * nf;
	out[15] = 0;
	return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 * 
 * @param {mat4}
 *            out mat4 frustum matrix will be written into
 * @param {number}
 *            fovy Vertical field of view in radians
 * @param {number}
 *            aspect Aspect ratio. typically viewport width/height
 * @param {number}
 *            near Near bound of the frustum
 * @param {number}
 *            far Far bound of the frustum
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.perspective = function(out, fovy, aspect, near, far) {
	var f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
	out[0] = f / aspect;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = f;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = (far + near) * nf;
	out[11] = -1;
	out[12] = 0;
	out[13] = 0;
	out[14] = (2 * far * near) * nf;
	out[15] = 0;
	return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 * 
 * @param {mat4}
 *            out mat4 frustum matrix will be written into
 * @param {number}
 *            left Left bound of the frustum
 * @param {number}
 *            right Right bound of the frustum
 * @param {number}
 *            bottom Bottom bound of the frustum
 * @param {number}
 *            top Top bound of the frustum
 * @param {number}
 *            near Near bound of the frustum
 * @param {number}
 *            far Far bound of the frustum
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.ortho = function(out, left, right, bottom, top, near, far) {
	var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
	out[0] = -2 * lr;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 0;
	out[5] = -2 * bt;
	out[6] = 0;
	out[7] = 0;
	out[8] = 0;
	out[9] = 0;
	out[10] = 2 * nf;
	out[11] = 0;
	out[12] = (left + right) * lr;
	out[13] = (top + bottom) * bt;
	out[14] = (far + near) * nf;
	out[15] = 1;
	return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up
 * axis
 * 
 * @param {mat4}
 *            out mat4 frustum matrix will be written into
 * @param {vec3}
 *            eye Position of the viewer
 * @param {vec3}
 *            center Point the viewer is looking at
 * @param {vec3}
 *            up vec3 pointing up
 * @returns {mat4} out
 */
BIMSURFER.Util.glMatrix.mat4.lookAt = function(out, eye, center, up) {
	var x0, x1, x2, y0, y1, y2, z0, z1, z2, len, eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];

	if (Math.abs(eyex - centerx) < GLMAT_EPSILON && Math.abs(eyey - centery) < GLMAT_EPSILON
			&& Math.abs(eyez - centerz) < GLMAT_EPSILON) {
		return BIMSURFER.Util.glMatrix.mat4.identity(out);
	}

	z0 = eyex - centerx;
	z1 = eyey - centery;
	z2 = eyez - centerz;

	len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy * z2 - upz * z1;
	x1 = upz * z0 - upx * z2;
	x2 = upx * z1 - upy * z0;
	len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}

	y0 = z1 * x2 - z2 * x1;
	y1 = z2 * x0 - z0 * x2;
	y2 = z0 * x1 - z1 * x0;

	len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1 / len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	out[0] = x0;
	out[1] = y0;
	out[2] = z0;
	out[3] = 0;
	out[4] = x1;
	out[5] = y1;
	out[6] = z1;
	out[7] = 0;
	out[8] = x2;
	out[9] = y2;
	out[10] = z2;
	out[11] = 0;
	out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	out[15] = 1;

	return out;
};

/**
 * Returns a string representation of a mat4
 * 
 * @param {mat4}
 *            mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
BIMSURFER.Util.glMatrix.mat4.str = function(a) {
	return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', '
			+ a[7] + ', ' + a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + a[12] + ', ' + a[13] + ', '
			+ a[14] + ', ' + a[15] + ')';
};

/**
 * @class 3x3 Matrix
 * @name mat3
 */
BIMSURFER.Util.glMatrix.mat3 = {};

/**
 * Creates a new identity mat3
 * 
 * @returns {mat3} a new 3x3 matrix
 */
BIMSURFER.Util.glMatrix.mat3.create = function() {
	var out = new GLMAT_ARRAY_TYPE(9);
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
};

/**
 * Copies the upper-left 3x3 values into the given BIMSURFER.Util.glMatrix.mat3.
 * 
 * @param {mat3}
 *            out the receiving 3x3 matrix
 * @param {mat4}
 *            a the source 4x4 matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.fromMat4 = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[4];
	out[4] = a[5];
	out[5] = a[6];
	out[6] = a[8];
	out[7] = a[9];
	out[8] = a[10];
	return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 * 
 * @param {mat3}
 *            a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
BIMSURFER.Util.glMatrix.mat3.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(9);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
};

/**
 * Copy the values from one mat3 to another
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the source matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
};

/**
 * Set a mat3 to the identity matrix
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.identity = function(out) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;
	out[4] = 1;
	out[5] = 0;
	out[6] = 0;
	out[7] = 0;
	out[8] = 1;
	return out;
};

/**
 * Transpose the values of a mat3
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the source matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.transpose = function(out, a) {
	// If we are transposing ourselves we can skip a few steps but have to cache
	// some values
	if (out === a) {
		var a01 = a[1], a02 = a[2], a12 = a[5];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a01;
		out[5] = a[7];
		out[6] = a02;
		out[7] = a12;
	} else {
		out[0] = a[0];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a[1];
		out[4] = a[4];
		out[5] = a[7];
		out[6] = a[2];
		out[7] = a[5];
		out[8] = a[8];
	}

	return out;
};

/**
 * Inverts a mat3
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the source matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.invert = function(out, a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8],

	b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20,

	// Calculate the determinant
	det = a00 * b01 + a01 * b11 + a02 * b21;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = b01 * det;
	out[1] = (-a22 * a01 + a02 * a21) * det;
	out[2] = (a12 * a01 - a02 * a11) * det;
	out[3] = b11 * det;
	out[4] = (a22 * a00 - a02 * a20) * det;
	out[5] = (-a12 * a00 + a02 * a10) * det;
	out[6] = b21 * det;
	out[7] = (-a21 * a00 + a01 * a20) * det;
	out[8] = (a11 * a00 - a01 * a10) * det;
	return out;
};

/**
 * Calculates the adjugate of a mat3
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the source matrix
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.adjoint = function(out, a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];

	out[0] = (a11 * a22 - a12 * a21);
	out[1] = (a02 * a21 - a01 * a22);
	out[2] = (a01 * a12 - a02 * a11);
	out[3] = (a12 * a20 - a10 * a22);
	out[4] = (a00 * a22 - a02 * a20);
	out[5] = (a02 * a10 - a00 * a12);
	out[6] = (a10 * a21 - a11 * a20);
	out[7] = (a01 * a20 - a00 * a21);
	out[8] = (a00 * a11 - a01 * a10);
	return out;
};

/**
 * Calculates the determinant of a mat3
 * 
 * @param {mat3}
 *            a the source matrix
 * @returns {Number} determinant of a
 */
BIMSURFER.Util.glMatrix.mat3.determinant = function(a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];

	return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the first operand
 * @param {mat3}
 *            b the second operand
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.multiply = function(out, a, b) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8],

	b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];

	out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	out[2] = b00 * a02 + b01 * a12 + b02 * a22;

	out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	out[5] = b10 * a02 + b11 * a12 + b12 * a22;

	out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.mat3.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.mat3.mul = BIMSURFER.Util.glMatrix.mat3.multiply;

/**
 * Translate a mat3 by the given vector
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the matrix to translate
 * @param {vec2}
 *            v vector to translate by
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.translate = function(out, a, v) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], x = v[0], y = v[1];

	out[0] = a00;
	out[1] = a01;
	out[2] = a02;

	out[3] = a10;
	out[4] = a11;
	out[5] = a12;

	out[6] = x * a00 + y * a10 + a20;
	out[7] = x * a01 + y * a11 + a21;
	out[8] = x * a02 + y * a12 + a22;
	return out;
};

/**
 * Rotates a mat3 by the given angle
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.rotate = function(out, a, rad) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8],

	s = Math.sin(rad), c = Math.cos(rad);

	out[0] = c * a00 + s * a10;
	out[1] = c * a01 + s * a11;
	out[2] = c * a02 + s * a12;

	out[3] = c * a10 - s * a00;
	out[4] = c * a11 - s * a01;
	out[5] = c * a12 - s * a02;

	out[6] = a20;
	out[7] = a21;
	out[8] = a22;
	return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat3}
 *            a the matrix to rotate
 * @param {vec2}
 *            v the vec2 to scale the matrix by
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.scale = function(out, a, v) {
	var x = v[0], y = v[1];

	out[0] = x * a[0];
	out[1] = x * a[1];
	out[2] = x * a[2];

	out[3] = y * a[3];
	out[4] = y * a[4];
	out[5] = y * a[5];

	out[6] = a[6];
	out[7] = a[7];
	out[8] = a[8];
	return out;
};

/**
 * Copies the values from a mat2d into a mat3
 * 
 * @param {mat3}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the matrix to copy
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.fromMat2d = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = 0;

	out[3] = a[2];
	out[4] = a[3];
	out[5] = 0;

	out[6] = a[4];
	out[7] = a[5];
	out[8] = 1;
	return out;
};

/**
 * Calculates a 3x3 matrix from the given quaternion
 * 
 * @param {mat3}
 *            out mat3 receiving operation result
 * @param {quat}
 *            q Quaternion to create matrix from
 * 
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.fromQuat = function(out, q) {
	var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z,

	xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;

	out[0] = 1 - (yy + zz);
	out[3] = xy + wz;
	out[6] = xz - wy;

	out[1] = xy - wz;
	out[4] = 1 - (xx + zz);
	out[7] = yz + wx;

	out[2] = xz + wy;
	out[5] = yz - wx;
	out[8] = 1 - (xx + yy);

	return out;
};

/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 * 
 * @param {mat3}
 *            out mat3 receiving operation result
 * @param {mat4}
 *            a Mat4 to derive the normal matrix from
 * 
 * @returns {mat3} out
 */
BIMSURFER.Util.glMatrix.mat3.normalFromMat4 = function(out, a) {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01
			* a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20
			* a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,

	// Calculate the determinant
	det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

	out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

	out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

	return out;
};

/**
 * Returns a string representation of a mat3
 * 
 * @param {mat3}
 *            mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
BIMSURFER.Util.glMatrix.mat3.str = function(a) {
	return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', '
			+ a[7] + ', ' + a[8] + ')';
};

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description A mat2d contains six elements defined as:
 * 
 * <pre>
 * [ a, b, c, d, tx, ty ]
 * </pre>
 * 
 * This is a short form for the 3x3 matrix:
 * 
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * 
 * The last column is ignored so the array is shorter and operations are faster.
 */
BIMSURFER.Util.glMatrix.mat2d = {};

/**
 * Creates a new identity mat2d
 * 
 * @returns {mat2d} a new 2x3 matrix
 */
BIMSURFER.Util.glMatrix.mat2d.create = function() {
	var out = new GLMAT_ARRAY_TYPE(6);
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = 0;
	out[5] = 0;
	return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 * 
 * @param {mat2d}
 *            a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
BIMSURFER.Util.glMatrix.mat2d.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(6);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	return out;
};

/**
 * Copy the values from one mat2d to another
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the source matrix
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4];
	out[5] = a[5];
	return out;
};

/**
 * Set a mat2d to the identity matrix
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.identity = function(out) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	out[4] = 0;
	out[5] = 0;
	return out;
};

/**
 * Inverts a mat2d
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the source matrix
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.invert = function(out, a) {
	var aa = a[0], ab = a[1], ac = a[2], ad = a[3], atx = a[4], aty = a[5];

	var det = aa * ad - ab * ac;
	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = ad * det;
	out[1] = -ab * det;
	out[2] = -ac * det;
	out[3] = aa * det;
	out[4] = (ac * aty - ad * atx) * det;
	out[5] = (ab * atx - aa * aty) * det;
	return out;
};

/**
 * Calculates the determinant of a mat2d
 * 
 * @param {mat2d}
 *            a the source matrix
 * @returns {Number} determinant of a
 */
BIMSURFER.Util.glMatrix.mat2d.determinant = function(a) {
	return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the first operand
 * @param {mat2d}
 *            b the second operand
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.multiply = function(out, a, b) {
	var aa = a[0], ab = a[1], ac = a[2], ad = a[3], atx = a[4], aty = a[5], ba = b[0], bb = b[1], bc = b[2], bd = b[3], btx = b[4], bty = b[5];

	out[0] = aa * ba + ab * bc;
	out[1] = aa * bb + ab * bd;
	out[2] = ac * ba + ad * bc;
	out[3] = ac * bb + ad * bd;
	out[4] = ba * atx + bc * aty + btx;
	out[5] = bb * atx + bd * aty + bty;
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.mat2d.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.mat2d.mul = BIMSURFER.Util.glMatrix.mat2d.multiply;

/**
 * Rotates a mat2d by the given angle
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.rotate = function(out, a, rad) {
	var aa = a[0], ab = a[1], ac = a[2], ad = a[3], atx = a[4], aty = a[5], st = Math.sin(rad), ct = Math.cos(rad);

	out[0] = aa * ct + ab * st;
	out[1] = -aa * st + ab * ct;
	out[2] = ac * ct + ad * st;
	out[3] = -ac * st + ct * ad;
	out[4] = ct * atx + st * aty;
	out[5] = ct * aty - st * atx;
	return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the matrix to translate
 * @param {vec2}
 *            v the vec2 to scale the matrix by
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.scale = function(out, a, v) {
	var vx = v[0], vy = v[1];
	out[0] = a[0] * vx;
	out[1] = a[1] * vy;
	out[2] = a[2] * vx;
	out[3] = a[3] * vy;
	out[4] = a[4] * vx;
	out[5] = a[5] * vy;
	return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 * 
 * @param {mat2d}
 *            out the receiving matrix
 * @param {mat2d}
 *            a the matrix to translate
 * @param {vec2}
 *            v the vec2 to translate the matrix by
 * @returns {mat2d} out
 */
BIMSURFER.Util.glMatrix.mat2d.translate = function(out, a, v) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	out[4] = a[4] + v[0];
	out[5] = a[5] + v[1];
	return out;
};

/**
 * Returns a string representation of a mat2d
 * 
 * @param {mat2d}
 *            a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
BIMSURFER.Util.glMatrix.mat2d.str = function(a) {
	return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

/**
 * @class 2x2 Matrix
 * @name mat2
 */
BIMSURFER.Util.glMatrix.mat2 = {};

/**
 * Creates a new identity mat2
 * 
 * @returns {mat2} a new 2x2 matrix
 */
BIMSURFER.Util.glMatrix.mat2.create = function() {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 * 
 * @param {mat2}
 *            a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
BIMSURFER.Util.glMatrix.mat2.clone = function(a) {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
};

/**
 * Copy the values from one mat2 to another
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the source matrix
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.copy = function(out, a) {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];
	return out;
};

/**
 * Set a mat2 to the identity matrix
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.identity = function(out) {
	out[0] = 1;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
};

/**
 * Transpose the values of a mat2
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the source matrix
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.transpose = function(out, a) {
	// If we are transposing ourselves we can skip a few steps but have to cache
	// some values
	if (out === a) {
		var a1 = a[1];
		out[1] = a[2];
		out[2] = a1;
	} else {
		out[0] = a[0];
		out[1] = a[2];
		out[2] = a[1];
		out[3] = a[3];
	}

	return out;
};

/**
 * Inverts a mat2
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the source matrix
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.invert = function(out, a) {
	var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

	// Calculate the determinant
	det = a0 * a3 - a2 * a1;

	if (!det) {
		return null;
	}
	det = 1.0 / det;

	out[0] = a3 * det;
	out[1] = -a1 * det;
	out[2] = -a2 * det;
	out[3] = a0 * det;

	return out;
};

/**
 * Calculates the adjugate of a mat2
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the source matrix
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.adjoint = function(out, a) {
	// Caching this value is nessecary if out == a
	var a0 = a[0];
	out[0] = a[3];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = a0;

	return out;
};

/**
 * Calculates the determinant of a mat2
 * 
 * @param {mat2}
 *            a the source matrix
 * @returns {Number} determinant of a
 */
BIMSURFER.Util.glMatrix.mat2.determinant = function(a) {
	return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the first operand
 * @param {mat2}
 *            b the second operand
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.multiply = function(out, a, b) {
	var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	out[0] = a0 * b0 + a1 * b2;
	out[1] = a0 * b1 + a1 * b3;
	out[2] = a2 * b0 + a3 * b2;
	out[3] = a2 * b1 + a3 * b3;
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.mat2.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.mat2.mul = BIMSURFER.Util.glMatrix.mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the matrix to rotate
 * @param {Number}
 *            rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.rotate = function(out, a, rad) {
	var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], s = Math.sin(rad), c = Math.cos(rad);
	out[0] = a0 * c + a1 * s;
	out[1] = a0 * -s + a1 * c;
	out[2] = a2 * c + a3 * s;
	out[3] = a2 * -s + a3 * c;
	return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 * 
 * @param {mat2}
 *            out the receiving matrix
 * @param {mat2}
 *            a the matrix to rotate
 * @param {vec2}
 *            v the vec2 to scale the matrix by
 * @returns {mat2} out
 */
BIMSURFER.Util.glMatrix.mat2.scale = function(out, a, v) {
	var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], v0 = v[0], v1 = v[1];
	out[0] = a0 * v0;
	out[1] = a1 * v1;
	out[2] = a2 * v0;
	out[3] = a3 * v1;
	return out;
};

/**
 * Returns a string representation of a mat2
 * 
 * @param {mat2}
 *            mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
BIMSURFER.Util.glMatrix.mat2.str = function(a) {
	return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * @class Quaternion
 * @name quat
 */
BIMSURFER.Util.glMatrix.quat = {};

/**
 * Creates a new identity quat
 * 
 * @returns {quat} a new quaternion
 */
BIMSURFER.Util.glMatrix.quat.create = function() {
	var out = new GLMAT_ARRAY_TYPE(4);
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one vector to
 * another.
 * 
 * Both vectors are assumed to be unit length.
 * 
 * @param {quat}
 *            out the receiving quaternion.
 * @param {vec3}
 *            a the initial vector
 * @param {vec3}
 *            b the destination vector
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.rotationTo = (function() {
	var tmpvec3 = BIMSURFER.Util.glMatrix.vec3.create();
	var xUnitVec3 = BIMSURFER.Util.glMatrix.vec3.fromValues(1, 0, 0);
	var yUnitVec3 = BIMSURFER.Util.glMatrix.vec3.fromValues(0, 1, 0);

	return function(out, a, b) {
		var dot = BIMSURFER.Util.glMatrix.vec3.dot(a, b);
		if (dot < -0.999999) {
			BIMSURFER.Util.glMatrix.vec3.cross(tmpvec3, xUnitVec3, a);
			if (BIMSURFER.Util.glMatrix.vec3.length(tmpvec3) < 0.000001)
				BIMSURFER.Util.glMatrix.vec3.cross(tmpvec3, yUnitVec3, a);
			BIMSURFER.Util.glMatrix.vec3.normalize(tmpvec3, tmpvec3);
			BIMSURFER.Util.glMatrix.quat.setAxisAngle(out, tmpvec3, Math.PI);
			return out;
		} else if (dot > 0.999999) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
			out[3] = 1;
			return out;
		} else {
			BIMSURFER.Util.glMatrix.vec3.cross(tmpvec3, a, b);
			out[0] = tmpvec3[0];
			out[1] = tmpvec3[1];
			out[2] = tmpvec3[2];
			out[3] = 1 + dot;
			return BIMSURFER.Util.glMatrix.quat.normalize(out, out);
		}
	};
})();

/**
 * Sets the specified quaternion with values corresponding to the given axes.
 * Each axis is a vec3 and is expected to be unit length and perpendicular to
 * all other specified axes.
 * 
 * @param {vec3}
 *            view the vector representing the viewing direction
 * @param {vec3}
 *            right the vector representing the local "right" direction
 * @param {vec3}
 *            up the vector representing the local "up" direction
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.setAxes = (function() {
	var matr = BIMSURFER.Util.glMatrix.mat3.create();

	return function(out, view, right, up) {
		matr[0] = right[0];
		matr[3] = right[1];
		matr[6] = right[2];

		matr[1] = up[0];
		matr[4] = up[1];
		matr[7] = up[2];

		matr[2] = view[0];
		matr[5] = view[1];
		matr[8] = view[2];

		return BIMSURFER.Util.glMatrix.quat.normalize(out, BIMSURFER.Util.glMatrix.quat.fromMat3(out, matr));
	};
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 * 
 * @param {quat}
 *            a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
BIMSURFER.Util.glMatrix.quat.clone = BIMSURFER.Util.glMatrix.vec4.clone;

/**
 * Creates a new quat initialized with the given values
 * 
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @param {Number}
 *            w W component
 * @returns {quat} a new quaternion
 * @function
 */
BIMSURFER.Util.glMatrix.quat.fromValues = BIMSURFER.Util.glMatrix.vec4.fromValues;

/**
 * Copy the values from one quat to another
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a the source quaternion
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.copy = BIMSURFER.Util.glMatrix.vec4.copy;

/**
 * Set the components of a quat to the given values
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {Number}
 *            x X component
 * @param {Number}
 *            y Y component
 * @param {Number}
 *            z Z component
 * @param {Number}
 *            w W component
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.set = BIMSURFER.Util.glMatrix.vec4.set;

/**
 * Set a quat to the identity quaternion
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.identity = function(out) {
	out[0] = 0;
	out[1] = 0;
	out[2] = 0;
	out[3] = 1;
	return out;
};

/**
 * Sets a quat from the given angle and rotation axis, then returns it.
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {vec3}
 *            axis the axis around which to rotate
 * @param {Number}
 *            rad the angle in radians
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.setAxisAngle = function(out, axis, rad) {
	rad = rad * 0.5;
	var s = Math.sin(rad);
	out[0] = s * axis[0];
	out[1] = s * axis[1];
	out[2] = s * axis[2];
	out[3] = Math.cos(rad);
	return out;
};

/**
 * Adds two quat's
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a the first operand
 * @param {quat}
 *            b the second operand
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.add = BIMSURFER.Util.glMatrix.vec4.add;

/**
 * Multiplies two quat's
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a the first operand
 * @param {quat}
 *            b the second operand
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.multiply = function(out, a, b) {
	var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];

	out[0] = ax * bw + aw * bx + ay * bz - az * by;
	out[1] = ay * bw + aw * by + az * bx - ax * bz;
	out[2] = az * bw + aw * bz + ax * by - ay * bx;
	out[3] = aw * bw - ax * bx - ay * by - az * bz;
	return out;
};

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.quat.multiply}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.quat.mul = BIMSURFER.Util.glMatrix.quat.multiply;

/**
 * Scales a quat by a scalar number
 * 
 * @param {quat}
 *            out the receiving vector
 * @param {quat}
 *            a the vector to scale
 * @param {Number}
 *            b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.scale = BIMSURFER.Util.glMatrix.vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 * 
 * @param {quat}
 *            out quat receiving operation result
 * @param {quat}
 *            a quat to rotate
 * @param {number}
 *            rad angle (in radians) to rotate
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.rotateX = function(out, a, rad) {
	rad *= 0.5;

	var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw + aw * bx;
	out[1] = ay * bw + az * bx;
	out[2] = az * bw - ay * bx;
	out[3] = aw * bw - ax * bx;
	return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 * 
 * @param {quat}
 *            out quat receiving operation result
 * @param {quat}
 *            a quat to rotate
 * @param {number}
 *            rad angle (in radians) to rotate
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.rotateY = function(out, a, rad) {
	rad *= 0.5;

	var ax = a[0], ay = a[1], az = a[2], aw = a[3], by = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw - az * by;
	out[1] = ay * bw + aw * by;
	out[2] = az * bw + ax * by;
	out[3] = aw * bw - ay * by;
	return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 * 
 * @param {quat}
 *            out quat receiving operation result
 * @param {quat}
 *            a quat to rotate
 * @param {number}
 *            rad angle (in radians) to rotate
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.rotateZ = function(out, a, rad) {
	rad *= 0.5;

	var ax = a[0], ay = a[1], az = a[2], aw = a[3], bz = Math.sin(rad), bw = Math.cos(rad);

	out[0] = ax * bw + ay * bz;
	out[1] = ay * bw - ax * bz;
	out[2] = az * bw + aw * bz;
	out[3] = aw * bw - az * bz;
	return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components. Assumes
 * that quaternion is 1 unit in length. Any existing W component will be
 * ignored.
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a quat to calculate W component of
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.calculateW = function(out, a) {
	var x = a[0], y = a[1], z = a[2];

	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	return out;
};

/**
 * Calculates the dot product of two quat's
 * 
 * @param {quat}
 *            a the first operand
 * @param {quat}
 *            b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
BIMSURFER.Util.glMatrix.quat.dot = BIMSURFER.Util.glMatrix.vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a the first operand
 * @param {quat}
 *            b the second operand
 * @param {Number}
 *            t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.lerp = BIMSURFER.Util.glMatrix.vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a the first operand
 * @param {quat}
 *            b the second operand
 * @param {Number}
 *            t interpolation amount between the two inputs
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.slerp = function(out, a, b, t) {
	// benchmarks:
	// http://jsperf.com/quaternion-slerp-implementations

	var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];

	var omega, cosom, sinom, scale0, scale1;

	// calc cosine
	cosom = ax * bx + ay * by + az * bz + aw * bw;
	// adjust signs (if necessary)
	if (cosom < 0.0) {
		cosom = -cosom;
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
	}
	// calculate coefficients
	if ((1.0 - cosom) > 0.000001) {
		// standard case (slerp)
		omega = Math.acos(cosom);
		sinom = Math.sin(omega);
		scale0 = Math.sin((1.0 - t) * omega) / sinom;
		scale1 = Math.sin(t * omega) / sinom;
	} else {
		// "from" and "to" quaternions are very close
		// ... so we can do a linear interpolation
		scale0 = 1.0 - t;
		scale1 = t;
	}
	// calculate final values
	out[0] = scale0 * ax + scale1 * bx;
	out[1] = scale0 * ay + scale1 * by;
	out[2] = scale0 * az + scale1 * bz;
	out[3] = scale0 * aw + scale1 * bw;

	return out;
};

/**
 * Calculates the inverse of a quat
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a quat to calculate inverse of
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.invert = function(out, a) {
	var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3, invDot = dot ? 1.0 / dot
			: 0;

	// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

	out[0] = -a0 * invDot;
	out[1] = -a1 * invDot;
	out[2] = -a2 * invDot;
	out[3] = a3 * invDot;
	return out;
};

/**
 * Calculates the conjugate of a quat If the quaternion is normalized, this
 * function is faster than BIMSURFER.Util.glMatrix.quat.inverse and produces the
 * same result.
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a quat to calculate conjugate of
 * @returns {quat} out
 */
BIMSURFER.Util.glMatrix.quat.conjugate = function(out, a) {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = a[3];
	return out;
};

/**
 * Calculates the length of a quat
 * 
 * @param {quat}
 *            a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
BIMSURFER.Util.glMatrix.quat.length = BIMSURFER.Util.glMatrix.vec4.length;

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.quat.length}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.quat.len = BIMSURFER.Util.glMatrix.quat.length;

/**
 * Calculates the squared length of a quat
 * 
 * @param {quat}
 *            a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
BIMSURFER.Util.glMatrix.quat.squaredLength = BIMSURFER.Util.glMatrix.vec4.squaredLength;

/**
 * Alias for {@link BIMSURFER.Util.glMatrix.quat.squaredLength}
 * 
 * @function
 */
BIMSURFER.Util.glMatrix.quat.sqrLen = BIMSURFER.Util.glMatrix.quat.squaredLength;

/**
 * Normalize a quat
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {quat}
 *            a quaternion to normalize
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.normalize = BIMSURFER.Util.glMatrix.vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 * 
 * NOTE: The resultant quaternion is not normalized, so you should be sure to
 * renormalize the quaternion yourself where necessary.
 * 
 * @param {quat}
 *            out the receiving quaternion
 * @param {mat3}
 *            m rotation matrix
 * @returns {quat} out
 * @function
 */
BIMSURFER.Util.glMatrix.quat.fromMat3 = function(out, m) {
	// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	// article "Quaternion Calculus and Fast Animation".
	var fTrace = m[0] + m[4] + m[8];
	var fRoot;

	if (fTrace > 0.0) {
		// |w| > 1/2, may as well choose w > 1/2
		fRoot = Math.sqrt(fTrace + 1.0); // 2w
		out[3] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot; // 1/(4w)
		out[0] = (m[7] - m[5]) * fRoot;
		out[1] = (m[2] - m[6]) * fRoot;
		out[2] = (m[3] - m[1]) * fRoot;
	} else {
		// |w| <= 1/2
		var i = 0;
		if (m[4] > m[0])
			i = 1;
		if (m[8] > m[i * 3 + i])
			i = 2;
		var j = (i + 1) % 3;
		var k = (i + 2) % 3;

		fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
		out[i] = 0.5 * fRoot;
		fRoot = 0.5 / fRoot;
		out[3] = (m[k * 3 + j] - m[j * 3 + k]) * fRoot;
		out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
		out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
	}

	return out;
};

/**
 * Returns a string representation of a quatenion
 * 
 * @param {quat}
 *            vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
BIMSURFER.Util.glMatrix.quat.str = function(a) {
	return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

"use strict"

/**
 * Class: BIMSURFER.Events Event system that can be used for all BIMSURFER
 * classes. Enables the user to register, unregister and trigger events, based
 * on object instances
 */
BIMSURFER.Events = BIMSURFER.Class({
	CLASS : 'BIMSURFER.Events',
	SYSTEM : null,

	listeners : {},
	object : null,

	__construct : function(object) {
		this.object = object;
		this.listeners = {};
	},

	/**
	 * Register an event.
	 * 
	 * @param {String}
	 *            event The event name
	 * @param {Function}
	 *            callback The callback function that will be fired when the
	 *            event is triggered
	 * @param {Object}
	 *            [object] The object that will be used as "this" in the
	 *            callback function. Defaut = this.object
	 */
	register : function(event, callback, object) {
		if (typeof event != 'string' || typeof callback != 'function') {
			return;
		}

		if (!this.listeners[event]) {
			this.listeners[event] = new Array();
		}
		this.listeners[event].push({
			object : (!BIMSURFER.Util.isset(object) ? this.object : object),
			callback : callback
		});
	},

	/**
	 * Unregister a registered event
	 * 
	 * @param {String}
	 *            event The event name
	 * @param {Function}
	 *            callback The callback function that would be called when teh
	 *            event was triggered
	 * @param {Object}
	 *            [object] The object that would be used as "this" in the
	 *            callback function. Default = this.object
	 */
	unregister : function(event, callback, object) {
		if (typeof event != 'string' || typeof callback != 'function') {
			return;
		}

		object = (!BIMSURFER.Util.isset(object) ? this.object : object);

		if (this.listeners[event]) {
			for (var i = 0; i < this.listeners[event].length; i++) {
				if (this.listeners[event][i].object == object && this.listeners[event][i].callback == callback) {
					this.listeners[event].splice(i, 1);
					break;
				}
			}
		}
	},

	/**
	 * Trigger an event
	 * 
	 * @param {String}
	 *            event The event name
	 * @param {Array}
	 *            [eventArguments] The parameters that will be passed to the
	 *            registered callback function(s)
	 * @param {Object}
	 *            [object] The object that will be used as "this" in the
	 *            callback function instead of the preset one.
	 * @return success
	 */
	trigger : function(event, eventArguments, object) {
		if (typeof event != 'string') {
			return false;
		}
		eventArguments = eventArguments || new Array();
		if (!BIMSURFER.Util.isset(eventArguments)) {
			eventArguments = new Array();
		} else if (!BIMSURFER.Util.isArray(eventArguments)) {
			eventArguments = [ eventArguments ];
		}

		if (event.substring(0, 5).toLowerCase() == 'mouse') {
			eventArguments[0] = this.normalizeEvent(eventArguments[0]);
		}

		if (!this.listeners[event] || this.listeners[event].length == 0) {
			return true;
		}

		var listeners = this.listeners[event].slice(0);

		for (var i = 0; i < listeners.length; i++) {
			var continueEvent = null;
			if (BIMSURFER.Util.isset(object)) {
				continueEvent = listeners[i].callback.apply(object, eventArguments);
			} else {
				continueEvent = listeners[i].callback.apply(listeners[i].object, eventArguments);
			}

			if (continueEvent === false) {
				return false;
			}
		}
		return true;
	},

	/**
	 * Normalize mouse/touch events for browser compability
	 * 
	 * @param {Event}
	 *            event The event to be normalized
	 * @return event
	 */
	normalizeEvent : function(event) {
		// if(!event.offsetX) {
		// event.offsetX = (event.pageX - jQuery(event.target).offset().left);
		// event.offsetY = (event.pageY - jQuery(event.target).offset().top);
		// }
		return event;
	}
});
"use strict"

/**
 * Class: BIMSURFER.Control Controls affect the behavior of the viewer. They
 * allow everything from zooming, panning and navigating to selecting en showing
 * an object tree. Controls can be added to a Viewer. Some controls need a div
 * to be binded to.
 * 
 * Example: The following example shows how to add controls to a viewer > var
 * viewer = new BIM.Viewer('viewport'); > var panOrbit = new
 * BIMSURFER.Control.PickFlyOrbit(); > viewer.addControl(panOrbit); >
 * panOrbit.activate(); > > var clickSelect = new
 * BIMSURFER.Control.ClickSelect(); > clickSelect.events.register('select',
 * nodeSelected); > clickSelect.events.register('unselect', nodeUnselected); >
 * viewer.addControl(clickSelect); > clickSelect.activate();
 */
BIMSURFER.Control = BIMSURFER.Class({
	CLASS : 'BIMSURFER.Control',

	/**
	 * BIMSURFER.Viewer instance
	 */
	SYSTEM : null,

	/**
	 * The DIV element containing the control
	 */
	div : null,

	/**
	 * The DOM element of the control (drawn by the function redraw)
	 */
	DOMelement : null,

	/**
	 * Is the control active?
	 */
	active : false,

	/**
	 * BIMSURFER.Events instance. The events meganism of this control
	 */
	events : null,

	/**
	 * Default constructor for the controls
	 * 
	 * @constructor
	 * @param {string|DOMelement}
	 *            div ID or reference to a div
	 */
	__construct : function(div) {
		if (typeof div == 'string') {
			this.div = jQuery(document).find('div#' + div)[0] || null;
		} else if (jQuery(div).is('div')) {
			this.div = div;
		}

		this.events = new BIMSURFER.Events(this);
	},

	/**
	 * Default function to redraw the control
	 * 
	 * @return this
	 */
	redraw : function() {
		jQuery(this.div).empty();
		jQuery(this.DOMelement).remove();
		this.DOMelement = jQuery('<div />').addClass(this.CLASS.replace(/\./g, "-"));
		if (this.active) {
			jQuery(this.div).append(this.DOMelement);
		}
		return this;
	},

	/**
	 * Default function to set the parent viewer
	 * 
	 * @param {BIMSURFER.Viewer}
	 *            viewer The viewer the control is working for
	 * @return this
	 */
	setViewer : function(viewer) {
		if (this.active) {
			this.deactivate();
		}
		this.SYSTEM = viewer;
		return this;
	},

	/**
	 * Default function to remove the control from the viewer Sets the
	 * this.SYSTEM to null
	 * 
	 * @return this
	 */
	removeFromSurfer : function() {
		this.SYSTEM = null;
		return this;
	},

	/**
	 * Default function to initialize the control events
	 * 
	 * @return this
	 */
	initEvents : function() {
		return this;
	},

	/**
	 * Default function to activate the control
	 * 
	 * @return this
	 */
	activate : function() {
		if (this.div) {
			this.active = true;
			this.redraw();
			this.initEvents();
			this.show();
		}
		this.events.trigger('activated');
		return this;
	},

	/**
	 * Default function to activate the control when the scene is loaded
	 * 
	 * @return this
	 */
	activateWhenReady : function() {
		if (this.SYSTEM.sceneLoaded) {
			this.activate();
		} else {
			var _this = this;
			var sceneLoaded = function() {
				_this.SYSTEM.events.unregister('sceneLoaded', sceneLoaded);
				_this.activate();
			}
			this.SYSTEM.events.register('sceneLoaded', sceneLoaded);
		}
		return this;
	},

	/**
	 * Default function to deactivate the control
	 * 
	 * @return this
	 */
	deactivate : function() {
		this.active = false;
		this.initEvents();
		jQuery(this.DOMelement).remove();
		this.DOMelement = null;
		this.events.trigger('deactivated');
		return this;
	},

	/**
	 * Default function to show the control
	 * 
	 * @param {String}
	 *            [speed] The speed of the animation ('fast', 'normal' or
	 *            'slow'). Leave empty for no animation
	 * @return this
	 */
	show : function(speed) {
		switch (speed) {
		case 'fast':
		case 'normal':
		case 'slow':
			jQuery(this.DOMelement).stop().fadeIn(speed);
			break;
		default:
			jQuery(this.DOMelement).stop().show();
		}
		return this;
	},

	/**
	 * Default function to hide the control
	 * 
	 * @param {String}
	 *            [speed] The speed of the animation ('fast', 'normal' or
	 *            'slow'). Leave empty for no animation
	 * @return this
	 */
	hide : function(speed) {
		switch (speed) {
		case 'fast':
		case 'normal':
		case 'slow':
			jQuery(this.DOMelement).stop().fadeOut(speed);
			break;
		default:
			jQuery(this.DOMelement).stop().hide();
		}
		return this;
	}
});
function GeometryLoader(bimServerApi, models, viewer, type) {
	var o = this;
	o.models = models;
	o.bimServerApi = bimServerApi;
	o.viewer = viewer;
	o.state = {};
	o.progressListeners = [];
	o.objectAddedListeners = [];
	o.prepareReceived = false;
	o.todo = [];
	o.type = type;

	if (o.type == null) {
		o.type = "triangles";
	}

	o.stats = {
		nrPrimitives : 0,
		nrVertices : 0,
		nrNormals : 0,
		nrColors : 0
	};

	// GeometryInfo.oid -> GeometryData.oid
	// o.infoToData = {};

	// GeometryData.oid -> [GeometryInfo.oid]
	o.dataToInfo = {};

	// Loaded geometry, GeometryData.oid -> Boolean
	o.loadedGeometry = {};

	// GeometryInfo.oid -> IfcProduct.oid
	o.infoToOid = {};

	this.addProgressListener = function(progressListener) {
		o.progressListeners.push(progressListener);
	};

	this.readObject = function(data, geometryType) {
		data.align8();
		if (geometryType == 5) {
			var roid = data.readLong();
			var geometryInfoOid = data.readLong();
			var objectBounds = data.readDoubleArray(6);
			if (objectBounds[0] < o.modelBounds.min.x) {
				o.modelBounds.min.x = objectBounds[0];
			}
			if (objectBounds[1] < o.modelBounds.min.y) {
				o.modelBounds.min.y = objectBounds[1];
			}
			if (objectBounds[2] < o.modelBounds.min.z) {
				o.modelBounds.min.z = objectBounds[2];
			}
			if (objectBounds[3] > o.modelBounds.max.x) {
				o.modelBounds.max.x = objectBounds[3];
			}
			if (objectBounds[4] > o.modelBounds.max.y) {
				o.modelBounds.max.y = objectBounds[4];
			}
			if (objectBounds[5] > o.modelBounds.max.z) {
				o.modelBounds.max.z = objectBounds[5];
			}
			viewer.modelBounds = o.modelBounds;
			var transformationMatrix = data.readDoubleArray(16);
			var geometryDataOid = data.readLong();
			var coreIds = [ geometryDataOid ];
			// o.infoToData[geometryInfoOid] = geometryDataOid;

			if (o.state.mode == 0) {
				console.log("Mode is still 0, should be 1");
				return;
			}

			var oid = o.infoToOid[geometryInfoOid];
			if (oid == null) {
				console.log("Not found", geometryInfoOid);
			} else {
				o.models[roid].get(oid, function(object) {
					object.gid = geometryInfoOid;
					if (o.viewer.scene.findNode(geometryInfoOid) != null) {
						console.log("Node with id " + geometryInfoOid + " already existed");
						return;
					}
					var material = BIMSURFER.Constants.materials[object.getType()];
					var hasTransparency = false;
					if (material == null) {
						console.log("material not found", object.getType());
						material = BIMSURFER.Constants.materials["DEFAULT"];
					}
					if (material.a < 1) {
						hasTransparency = true;
					}

					var enabled = object.trans.mode == 0;

					var coreNodes = null;

					var loaded = o.loadedGeometry[geometryDataOid];
					if (loaded != null) {
						if (Array.isArray(loaded)) {
							coreNodes = [];
							loaded.forEach(function(id) {
								coreNodes.push({
									type : "geometry",
									coreId : id
								});
							});
						} else {
							coreNodes = [ {
								type : "geometry",
								coreId : geometryDataOid
							} ];
						}
					} else {
						if (o.dataToInfo[geometryDataOid] == null) {
							o.dataToInfo[geometryDataOid] = [ geometryInfoOid ];
						} else {
							o.dataToInfo[geometryDataOid].push(geometryInfoOid);
						}
					}
					var flags = {
						type : "flags",
						flags : {
							transparent : hasTransparency
						},
						nodes : [ {
							type : "layer",
							priority : 0,
							nodes : [ {
								type : "enable",
								enabled : enabled,
								nodes : [ {
									type : "material",
									baseColor : material,
									alpha : 1,
								}, {
									type : "material",
									baseColor : material,
									alpha : material.a,
									nodes : [ {
										type : "name",
										id : geometryInfoOid,
										data : {
											object : object
										},
										nodes : [ {
											type : "matrix",
											elements : transformationMatrix,
											nodes : coreNodes
										} ]
									} ]
								} ]
							} ]
						} ]
					};

					o.modelNode.addNode(flags);

					o.objectAddedListeners.forEach(function(listener) {
						listener(oid);
					});
				});
			}
		} else if (geometryType == 3) {
			var coreIds = [];
			var geometryDataOid = data.readLong();
			var nrParts = data.readInt();
			// var objectBounds = data.readFloatArray(6);

			for (var i = 0; i < nrParts; i++) {
				var coreId = data.readLong() + 1;
				coreIds.push(coreId);
				var nrIndices = data.readInt();
				o.stats.nrPrimitives += nrIndices / 3;
				var indices = data.readShortArray(nrIndices);
				data.align4();
				var nrVertices = data.readInt();
				o.stats.nrVertices += nrVertices;
				var vertices = data.readFloatArray(nrVertices);
				var nrNormals = data.readInt();
				o.stats.nrNormals += nrNormals;
				var normals = data.readFloatArray(nrNormals);
				var nrColors = data.readInt();
				o.stats.nrColors += nrColors;
				var colors = data.readFloatArray(nrColors);

				var geometry = {
					type : "geometry",
					primitive : o.type
				};

				geometry.coreId = coreId;

				if (o.type == "lines") {
					geometry.indices = o.convertToLines(indices);
				} else {
					geometry.indices = indices;
				}
				geometry.positions = vertices;
				geometry.normals = normals;

				if (colors != null && colors.length > 0) {
					geometry.colors = colors;
				}
				o.library.add("node", geometry);
			}
			o.loadedGeometry[geometryDataOid] = coreIds;
			if (o.dataToInfo[geometryDataOid] != null) {
				o.dataToInfo[geometryDataOid].forEach(function(geometryInfoId) {
					var node = o.viewer.scene.findNode(geometryInfoId);
					if (node != null && node.nodes[0] != null) {
						coreIds.forEach(function(coreId) {
							node.nodes[0].addNode({
								type : "geometry",
								coreId : coreId
							});
						});
					}
				});
				delete o.dataToInfo[geometryDataOid];
			}
		} else if (geometryType == 1) {
			var geometryDataOid = data.readLong();
			var nrIndices = data.readInt();
			var indices = data.readShortArray(nrIndices);
			o.stats.nrPrimitives += nrIndices / 3;
			data.align4();
			var nrVertices = data.readInt();
			var vertices = data.readFloatArray(nrVertices);
			o.stats.nrVertices += nrVertices;
			var nrNormals = data.readInt();
			o.stats.nrNormals += nrNormals;
			var normals = data.readFloatArray(nrNormals);
			var nrColors = data.readInt();
			o.stats.nrColors += nrColors;
			var colors = data.readFloatArray(nrColors);

			var geometry = {
				type : "geometry",
				primitive : o.type
			};

			geometry.coreId = geometryDataOid;
			if (o.type == "lines") {
				geometry.indices = o.convertToLines(indices);
			} else {
				geometry.indices = indices;
			}
			geometry.positions = vertices;
			geometry.normals = normals;

			if (colors != null && colors.length > 0) {
				geometry.colors = colors;
			}
			o.library.add("node", geometry);

			o.loadedGeometry[geometryDataOid] = true;
			if (o.dataToInfo[geometryDataOid] != null) {
				o.dataToInfo[geometryDataOid].forEach(function(geometryInfoId) {
					var node = o.viewer.scene.findNode(geometryInfoId);
					if (node != null && node.nodes[0] != null) {
						node.nodes[0].addNode({
							type : "geometry",
							coreId : geometryDataOid
						});
					}
				});
				delete o.dataToInfo[geometryDataOid];
			}
		}

		o.state.nrObjectsRead++;
		// o.updateProgress();
	};

	this.convertToLines = function(indices) {
		var lineIndices = [];
		for (var i = 0; i < indices.length; i += 3) {
			var i1 = indices[i];
			var i2 = indices[i + 1];
			var i3 = indices[i + 2];

			lineIndices.push(i1, i2);
			lineIndices.push(i2, i3);
			lineIndices.push(i3, i1);
		}
		return lineIndices;
	}

	this.updateProgress = function() {
		o.progressListeners.forEach(function(progressListener) {
			progressListener("Loading", -1);
		});

	};

	this.downloadInitiated = function() {
		o.state = {
			mode : 0,
			nrObjectsRead : 0,
			nrObjects : 0
		};

		o.library = o.viewer.scene.findNode("library-" + o.groupId);
		if (o.library == null) {
			o.library = o.viewer.scene.addNode({
				id : "library-" + o.groupId,
				type : "library"
			});
		}

		var msg = {
			topicId : o.topicId
		};

		o.bimServerApi.setBinaryDataListener(o.topicId, o.binaryDataListener);
		o.bimServerApi.downloadViaWebsocket(msg);
	};

	this.binaryDataListener = function(data) {
		o.todo.push(data);
	};
	this.readEnd = function(data) {
		if (Object.keys(o.dataToInfo).length > 0) {
			console.error("Unsolved links");
			for ( var key in o.dataToInfo) {
				console.log(key, o.dataToInfo[key]);
			}
		}
		console.log("reading end");
		o.boundsTranslate = o.viewer.scene.findNode("bounds_translate");

		var center = {
			x : (o.modelBounds.max.x + o.modelBounds.min.x) / 2,
			y : (o.modelBounds.max.y + o.modelBounds.min.y) / 2,
			z : (o.modelBounds.max.z + o.modelBounds.min.z) / 2,
		};

		o.boundsTranslate.x = -o.center.x;
		o.boundsTranslate.y = -o.center.y;
		o.boundsTranslate.z = -o.center.z;

		var lookat = o.viewer.scene.findNode("main-lookAt");
		var eye = {
			x : (o.modelBounds.max.x - o.modelBounds.min.x) * 0.5,
			y : (o.modelBounds.max.y - o.modelBounds.min.y) * -1.5,
			z : (o.modelBounds.max.z - o.modelBounds.min.z) * 0.5
		};
		lookat.set("eye", eye);

		var maincamera = o.viewer.scene.findNode("main-camera");

		var diagonal = Math.sqrt(Math.pow(o.modelBounds.max.x - o.modelBounds.min.x, 2)
				+ Math.pow(o.modelBounds.max.y - o.modelBounds.min.y, 2)
				+ Math.pow(o.modelBounds.max.z - o.modelBounds.min.z, 2));

		var far = diagonal * 5; // 5 being a guessed constant that should
		// somehow coincide with the max zoom-out-factor

		maincamera.setOptics({
			type : 'perspective',
			far : far,
			near : far / 1000,
			aspect : jQuery(o.viewer.canvas).width() / jQuery(o.viewer.canvas).height(),
			fovy : 37.8493
		});

		console.log(o.stats);

		o.viewer.SYSTEM.events.trigger('progressDone');
		o.progressListeners.forEach(function(progressListener) {
			progressListener("done", o.state.nrObjectsRead, o.state.nrObjectsRead);
		});
		o.bimServerApi.call("ServiceInterface", "cleanupLongAction", {
			topicId : o.topicId
		}, function() {
		});
	}

	this.readStart = function(data) {
		var start = data.readUTF8();
		if (start != "BGS") {
			console.log("Stream does not start with BGS (" + start + ")");
			return false;
		}
		var version = data.readByte();
		if (version != 10) {
			console.log("Unimplemented version");
			return false;
		} else {
			o.state.version = version;
		}
		data.align8();

		var modelBounds = data.readDoubleArray(6);
		o.modelBounds = {
			min : {
				x : modelBounds[0],
				y : modelBounds[1],
				z : modelBounds[2]
			},
			max : {
				x : modelBounds[3],
				y : modelBounds[4],
				z : modelBounds[5]
			}
		};
		o.center = {
			x : (o.modelBounds.max.x + o.modelBounds.min.x) / 2,
			y : (o.modelBounds.max.y + o.modelBounds.min.y) / 2,
			z : (o.modelBounds.max.z + o.modelBounds.min.z) / 2,
		};

		o.boundsTranslate = o.viewer.scene.findNode("bounds_translate");
		var firstModel = false;
		if (o.boundsTranslate == null) {
			var firstModel = true;
			o.boundsTranslate = {
				id : "bounds_translate",
				type : "translate",
				x : -o.center.x,
				y : -o.center.y,
				z : -o.center.z,
				nodes : []
			}
			o.boundsTranslate = o.viewer.scene.findNode("my-lights").addNode(o.boundsTranslate);
		}

		o.modelNode = o.viewer.scene.findNode("model_node_" + o.groupId);
		if (o.modelNode == null) {
			o.modelNode = {
				id : "model_node_" + o.groupId,
				type : "translate",
				x : 0,
				y : 0,
				z : 0,
				data : {
					groupId : o.groupId
				},
				nodes : []
			};
			o.modelNode = o.boundsTranslate.addNode(o.modelNode);
		}

		if (firstModel) {
			var lookat = o.viewer.scene.findNode("main-lookAt");
			var eye = {
				x : (o.modelBounds.max.x - o.modelBounds.min.x) * 0.5,
				y : (o.modelBounds.max.y - o.modelBounds.min.y) * -1.5,
				z : (o.modelBounds.max.z - o.modelBounds.min.z) * 0.5
			};
			lookat.set("eye", eye);

			var maincamera = o.viewer.scene.findNode("main-camera");

			var diagonal = Math.sqrt(Math.pow(o.modelBounds.max.x - o.modelBounds.min.x, 2)
					+ Math.pow(o.modelBounds.max.y - o.modelBounds.min.y, 2)
					+ Math.pow(o.modelBounds.max.z - o.modelBounds.min.z, 2));

			var far = diagonal * 5; // 5 being a guessed constant that should
			// somehow coincide with the max
			// zoom-out-factor

			maincamera.setOptics({
				type : 'perspective',
				far : far,
				near : far / 1000,
				aspect : jQuery(o.viewer.canvas).width() / jQuery(o.viewer.canvas).height(),
				fovy : 37.8493
			});

			o.viewer.events.trigger('sceneLoaded', [ o.viewer.scene ]);
		}
		o.state.mode = 1;
		// o.state.nrObjects = data.readInt();
		// o.updateProgress();
		// console.log("Nr Objects", o.state.nrObjects);
	};

	this.process = function() {
		var data = o.todo.shift();
		while (data != null) {
			inputStream = new BIMSURFER.DataInputStreamReader(null, data);
			var topicId = inputStream.readLong(); // Which we don't use here
			var messageType = inputStream.readByte();
			if (messageType == 0) {
				o.readStart(inputStream);
			} else if (messageType == 6) {
				o.readEnd(inputStream);
			} else {
				o.readObject(inputStream, messageType);
			}
			data = o.todo.shift();
		}
	};

	this.progressHandler = function(topicId, state) {
		if (topicId == o.topicId) {
			if (state.title == "Done preparing") {
				if (!o.prepareReceived) {
					o.prepareReceived = true;
					o.downloadInitiated();
				}
			}
			if (state.state == "FINISHED") {
				o.bimServerApi.unregisterProgressHandler(o.topicId, o.progressHandler);
			}
			o.progressListeners.forEach(function(progressListener) {
				progressListener("Loading" + (o.options.title == null ? "" : " " + o.options.title) + "...",
						state.progress);
			});
		}
	};

	this.setTitle = function(title) {
		o.options.title = title;
	}

	this.setLoadOids = function(roids, oids) {
		o.options = {
			type : "oids",
			roids : roids,
			oids : oids
		};
	}

	this.start = function() {
		if (o.options != null) {
			o.groupId = o.options.roids[0];

			o.infoToOid = {};

			var oids = [];
			o.options.oids.forEach(function(object) {
				if (object.gid != null) {
					o.infoToOid[object.gid] = object.oid;
					oids.push(object.gid);
				}
			});

			if (oids.length > 0) {
				var query = {
					type : "GeometryInfo",
					oids : oids,
					include : {
						type : "GeometryInfo",
						field : "data"
					}
				};
				o.bimServerApi.getSerializerByPluginClassName(
						"org.bimserver.serializers.binarygeometry.BinaryGeometryMessagingStreamingSerializerPlugin3",
						function(serializer) {
							o.bimServerApi.call("ServiceInterface", "download", {
								roids : o.options.roids,
								serializerOid : serializer.oid,
								sync : false,
								query : JSON.stringify(query)
							}, function(topicId) {
								o.topicId = topicId;
								o.bimServerApi.registerProgressHandler(o.topicId, o.progressHandler);
							});
						});
			}
		}
	};
}
"use strict"

/**
 * Class: BIMSURFER.DataInputStreamReader Class to read binary data from the
 * BIMServer
 */
BIMSURFER.DataInputStreamReader = BIMSURFER
		.Class({
			CLASS : 'BIMSurfer.DataInputStreamReader',
			SYSTEM : null,

			arrayBuffer : null,
			dataView : null,
			pos : null,

			__construct : function(system, arrayBuffer) {
				this.arrayBuffer = arrayBuffer;
				this.dataView = new DataView(this.arrayBuffer);
				this.pos = 0;
			},

			readUTF8 : function() {
				var length = this.dataView.getInt16(this.pos);
				this.pos += 2;
				var view = this.arrayBuffer.slice(this.pos, this.pos + length);
				var result = new StringView(view).toString();
				this.pos += length;
				return result;
			},

			align4 : function() {
				// Skips to the next alignment of 4 (source should have done the
				// same!)
				var skip = 4 - (this.pos % 4);
				if (skip > 0 && skip != 4) {
					// console.log("Skip", skip);
					this.pos += skip;
				}
			},

			align8 : function() {
				// Skips to the next alignment of 4 (source should have done the
				// same!)
				var skip = 8 - (this.pos % 8);
				if (skip > 0 && skip != 8) {
					// console.log("Skip", skip);
					this.pos += skip;
				}
			},

			readFloat : function() {
				var value = this.dataView.getFloat32(this.pos, true);
				this.pos += 4;
				return value;
			},

			readInt : function() {
				var value = this.dataView.getInt32(this.pos, true);
				this.pos += 4;
				return value;
			},

			readByte : function() {
				var value = this.dataView.getInt8(this.pos);
				this.pos += 1;
				return value;
			},

			readLong : function() {
				var value = this.dataView.getUint32(this.pos, true) + 0x100000000
						* this.dataView.getUint32(this.pos + 4, true);
				this.pos += 8;
				return value;
			},

			readFloatArray2 : function(length) {
				var results = [];
				for (var i = 0; i < length; i++) {
					var value = this.dataView.getFloat32(this.pos, true);
					this.pos += 4;
					results.push(value);
				}
				return results;
			},

			readFloatArray : function(length) {
				try {
					var result = new Float32Array(this.arrayBuffer, this.pos, length);
					this.pos += length * 4;
					return result;
				} catch (e) {
					console.error(e, this.arrayBuffer.byteLength, this.pos, length);
				}
			},

			readDoubleArray : function(length) {
				var result = new Float64Array(this.arrayBuffer, this.pos, length);
				this.pos += length * 8;
				return result;
			},

			readIntArray2 : function(length) {
				var results = [];
				for (var i = 0; i < length; i++) {
					var value = this.dataView.getInt32(this.pos, true);
					this.pos += 4;
					results.push(value);
				}
				return results;
			},

			readIntArray : function(length) {
				var result = new Int32Array(this.arrayBuffer, this.pos, length);
				this.pos += length * 4;
				return result;
			},

			readShortArray : function(length) {
				try {
					var result = new Int16Array(this.arrayBuffer, this.pos, length);
					this.pos += length * 2;
					return result;
				} catch (e) {
					console.error(e, this.pos, length);
				}
			}
		});
"use strict"

/**
 * Class: BIMSURFER.ProgressLoader A class to manage the BIMServer progress. Can
 * register progress listeners on the server for long running actions
 */
BIMSURFER.ProgressLoader = BIMSURFER.Class({
	CLASS : 'BIMSURFER.Class',
	SYSTEM : null,

	server : null,
	topicId : null,
	step : null,
	done : null,
	autoUnregister : null,
	registered : null,

	/**
	 * @constructor
	 * @param {BIMSURFER.Viewer
	 *            instance} system The viewer instance
	 * @param {BimServerAPI
	 *            instance} server The API provided by a connected BIMServer
	 * @param {Number}
	 *            topicId The TopicID, provided by the BIMServer
	 * @param {Function}
	 *            step The callback function for everey progress response by the
	 *            server
	 * @param {Function
	 *            done The callback function that will be fired when the server
	 *            gives a STATE == Finished
	 * @param {Boolean}
	 *            [autoUnregister] Should it automatically unregister the
	 *            progress listener on the server?
	 */

	__construct : function(system, server, topicId, step, done, autoUnregister) {
		this.SYSTEM = system;
		this.server = server;
		this.topicId = topicId;
		this.step = step;
		this.done = done;
		this.autoUnregister = autoUnregister;
		this.registered = false;

		var _this = this;
		var registering = true;

		this.responseHandler = function(topicId, state) {
			if (!_this.registered && !registering) {
				return;
			}
			_this.registered = true;
			_this.progressHandler.apply(_this, [ topicId, state ]);
		};

		this.server.registerProgressHandler(this.topicId, this.responseHandler, function() {
			_this.registered = true;
			registering = false;
		});
	},

	unregister : function() {
		var _this = this;
		this.server.unregisterProgressHandler(this.topicId, this.responseHandler);
		this.registered = false;
	},

	responseHandler : null,

	progressHandler : function(topicId, state) {
		if (state.state == "FINISHED") {
			if (this.autoUnregister && this.registered) {
				this.unregister();
			}
			this.done(state, this);
		} else {
			this.step(state, this);
		}
	}
});

if (typeof BIMSURFER.Constants != 'object') {
	BIMSURFER.Constants = {};
}

/**
 * Time in milliseconds before a connect or login action will timeout
 */
BIMSURFER.Constants.timeoutTime = 10000; // ms

/**
 * The default IFC Types to load
 */
BIMSURFER.Constants.defaultTypes = [ "IfcColumn", "IfcStair", "IfcSlab", "IfcWindow",
// "IfcOpeningElement",
"IfcDoor", "IfcBuildingElementProxy", "IfcWallStandardCase", "IfcWall", "IfcBeam", "IfcRailing", "IfcProxy", "IfcRoof" ];

// writeMaterial(jsonWriter, "IfcSpace", new double[] { 0.137255f, 0.403922f,
// 0.870588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcRoof", new double[] { 0.837255f, 0.203922f,
// 0.270588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcSlab", new double[] { 0.637255f, 0.603922f,
// 0.670588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcWall", new double[] { 0.537255f, 0.337255f,
// 0.237255f }, 1.0f);
// writeMaterial(jsonWriter, "IfcWallStandardCase", new double[] { 1.0f, 1.0f,
// 1.0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcDoor", new double[] { 0.637255f, 0.603922f,
// 0.670588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcWindow", new double[] { 0.2f, 0.2f, 0.8f },
// 0.2f);
// writeMaterial(jsonWriter, "IfcRailing", new double[] { 0.137255f, 0.203922f,
// 0.270588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcColumn", new double[] { 0.437255f, 0.603922f,
// 0.370588f, }, 1.0f);
// writeMaterial(jsonWriter, "IfcBeam", new double[] { 0.437255f, 0.603922f,
// 0.370588f, }, 1.0f);
// writeMaterial(jsonWriter, "IfcFurnishingElement", new double[] { 0.437255f,
// 0.603922f, 0.370588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcCurtainWall", new double[] { 0.5f, 0.5f, 0.5f
// }, 0.5f);
// writeMaterial(jsonWriter, "IfcStair", new double[] { 0.637255f, 0.603922f,
// 0.670588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcBuildingElementProxy", new double[] { 0.5f,
// 0.5f, 0.5f }, 1.0f);
// writeMaterial(jsonWriter, "IfcFlowSegment", new double[] { 0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcFlowFitting", new double[] { 0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcFlowTerminal", new double[] { 0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcProxy", new double[] { 0.637255f, 0.603922f,
// 0.670588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcSite", new double[] { 0.637255f, 0.603922f,
// 0.670588f }, 1.0f);
// writeMaterial(jsonWriter, "IfcLightFixture", new double[] {0.8470588235f,
// 0.8470588235f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcDuctSegment", new double[] {0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcDuctFitting", new double[] {0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);
// writeMaterial(jsonWriter, "IfcAirTerminal", new double[] {0.8470588235f,
// 0.427450980392f, 0f }, 1.0f);

BIMSURFER.Constants.materials = {
	IfcSpace : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcRoof : {
		r : 0.837255,
		g : 0.203922,
		b : 0.270588,
		a : 1.0
	},
	IfcSlab : {
		r : 0.637255,
		g : 0.603922,
		b : 0.670588,
		a : 1.0
	},
	IfcWall : {
		r : 0.537255,
		g : 0.337255,
		b : 0.237255,
		a : 1.0
	},
	IfcWallStandardCase : {
		r : 0.537255,
		g : 0.337255,
		b : 0.237255,
		a : 1.0
	},
	IfcDoor : {
		r : 0.637255,
		g : 0.603922,
		b : 0.670588,
		a : 1.0
	},
	IfcWindow : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 0.5
	},
	IfcOpeningElement : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 0
	},
	IfcRailing : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcColumn : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcBeam : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcBeamStandardCase : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcFurnishingElement : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcCurtainWall : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcStair : {
		r : 0.637255,
		g : 0.603922,
		b : 0.670588,
		a : 1.0
	},
	IfcStairFlight : {
		r : 0.637255,
		g : 0.603922,
		b : 0.670588,
		a : 1.0
	},
	IfcBuildingElementProxy : {
		r : 0.5,
		g : 0.5,
		b : 0.5,
		a : 1.0
	},
	IfcFlowSegment : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcFlowitting : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcFlowTerminal : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcProxy : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcSite : {
		r : 0.137255,
		g : 0.403922,
		b : 0.870588,
		a : 1.0
	},
	IfcLightFixture : {
		r : 0.8470588235,
		g : 0.8470588235,
		b : 0.870588,
		a : 1.0
	},
	IfcDuctSegment : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcDistributionFlowElement : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcDuctFitting : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcPlate : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 0.5
	},
	IfcPile : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcAirTerminal : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcMember : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcCovering : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcTransportElement : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcFlowController : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcFlowFitting : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcRamp : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcFurniture : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcFooting : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcSystemFurnitureElement : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	},
	IfcSpace : {
		r : 0.137255,
		g : 0.303922,
		b : 0.570588,
		a : 0.5
	},
	IfcBuildingElementPart : {
		r : 1,
		g : 0.5,
		b : 0.5,
		a : 1.0
	},
	IfcDistributionElement : {
		r : 1,
		g : 0.5,
		b : 0.5,
		a : 1.0
	},
	DEFAULT : {
		r : 0.8470588235,
		g : 0.427450980392,
		b : 0,
		a : 1.0
	}
}

/*
 * Default camera settings
 */
BIMSURFER.Constants.camera = {
	maxOrbitSpeed : Math.PI * 0.1,
	orbitSpeedFactor : 0.05,
	zoomSpeedFactor : 0.1,
	panSpeedFactor : 0.6
};

/*
 * Default markup for highlighted objects
 */
BIMSURFER.Constants.highlightSelectedObject = {
	type : 'material',
	wire : true,
	id : 'highlight',
	emit : 0.0,
	baseColor : {
		r : 0.0,
		g : 1,
		b : 0
	}
}

/*
 * Default markup for highlighted special objects
 */
BIMSURFER.Constants.highlightSelectedSpecialObject = {
	type : 'material',
	id : 'specialselectedhighlight',
	emit : 1,
	baseColor : {
		r : 0.16,
		g : 0.70,
		b : 0.88
	},
	shine : 10.0
};

/*
 * Enumeration for progressbar types
 */
BIMSURFER.Constants.ProgressBarStyle = {
	Continuous : 1,
	Marquee : 2
}

/**
 * Returns a number whose value is limited to the given range.
 * 
 * Example: limit the output of this computation to between 0 and 255 (x *
 * 255).clamp(0, 255)
 * 
 * @param {Number}
 *            s The number to clamp
 * @param {Number}
 *            min The lower boundary of the output range
 * @param {Number}
 *            max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
BIMSURFER.Constants.clamp = function(s, min, max) {
	return Math.min(Math.max(s, min), max);
};
"use strict";

/*
 * \ |*| |*| :: Number.isInteger() polyfill :: |*| |*|
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * |*| \
 */

if (!Number.isInteger) {
	Number.isInteger = function isInteger(nVal) {
		return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992
				&& Math.floor(nVal) === nVal;
	};
}

/*
 * \ |*| |*| StringView - Mozilla Developer Network - revision #6 |*| |*|
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays/StringView
 * |*| https://developer.mozilla.org/User:fusionchess |*| |*| This framework is
 * released under the GNU Public License, version 3 or later. |*|
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html |*| \
 */

function StringView(vInput, sEncoding /* optional (default: UTF-8) */, nOffset /* optional */, nLength /* optional */) {

	var fTAView, aWhole, aRaw, fPutOutptCode, fGetOutptChrSize, nInptLen, nStartIdx = isFinite(nOffset) ? nOffset : 0, nTranscrType = 15;

	if (sEncoding) {
		this.encoding = sEncoding.toString();
	}

	encSwitch: switch (this.encoding) {
	case "UTF-8":
		fPutOutptCode = StringView.putUTF8CharCode;
		fGetOutptChrSize = StringView.getUTF8CharLength;
		fTAView = Uint8Array;
		break encSwitch;
	case "UTF-16":
		fPutOutptCode = StringView.putUTF16CharCode;
		fGetOutptChrSize = StringView.getUTF16CharLength;
		fTAView = Uint16Array;
		break encSwitch;
	case "UTF-32":
		fTAView = Uint32Array;
		nTranscrType &= 14;
		break encSwitch;
	default:
		/* case "ASCII", or case "BinaryString" or unknown cases */
		fTAView = Uint8Array;
		nTranscrType &= 14;
	}

	typeSwitch: switch (typeof vInput) {
	case "string":
		/*
		 * the input argument is a primitive string: a new buffer will be
		 * created.
		 */
		nTranscrType &= 7;
		break typeSwitch;
	case "object":
		classSwitch: switch (vInput.constructor) {
		case StringView:
			/* the input argument is a stringView: a new buffer will be created. */
			nTranscrType &= 3;
			break typeSwitch;
		case String:
			/*
			 * the input argument is an objectified string: a new buffer will be
			 * created.
			 */
			nTranscrType &= 7;
			break typeSwitch;
		case ArrayBuffer:
			/* the input argument is an arrayBuffer: the buffer will be shared. */
			aWhole = new fTAView(vInput);
			nInptLen = this.encoding === "UTF-32" ? vInput.byteLength >>> 2
					: this.encoding === "UTF-16" ? vInput.byteLength >>> 1 : vInput.byteLength;
			aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ? aWhole : new fTAView(vInput,
					nStartIdx, !isFinite(nLength) ? nInptLen - nStartIdx : nLength);

			break typeSwitch;
		case Uint32Array:
		case Uint16Array:
		case Uint8Array:
			/*
			 * the input argument is a typedArray: the buffer, and possibly the
			 * array itself, will be shared.
			 */
			fTAView = vInput.constructor;
			nInptLen = vInput.length;
			aWhole = vInput.byteOffset === 0
					&& vInput.length === (fTAView === Uint32Array ? vInput.buffer.byteLength >>> 2
							: fTAView === Uint16Array ? vInput.buffer.byteLength >>> 1 : vInput.buffer.byteLength) ? vInput
					: new fTAView(vInput.buffer);
			aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ? vInput : vInput.subarray(
					nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);

			break typeSwitch;
		default:
			/*
			 * the input argument is an array or another serializable object: a
			 * new typedArray will be created.
			 */
			aWhole = new fTAView(vInput);
			nInptLen = aWhole.length;
			aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ? aWhole : aWhole.subarray(
					nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);
		}
		break typeSwitch;
	default:
		/*
		 * the input argument is a number, a boolean or a function: a new
		 * typedArray will be created.
		 */
		aWhole = aRaw = new fTAView(Number(vInput) || 0);

	}

	if (nTranscrType < 8) {

		var vSource, nOutptLen, nCharStart, nCharEnd, nEndIdx, fGetInptChrSize, fGetInptChrCode;

		if (nTranscrType & 4) { /* input is string */

			vSource = vInput;
			nOutptLen = nInptLen = vSource.length;
			nTranscrType ^= this.encoding === "UTF-32" ? 0 : 2;
			/*
			 * ...or...: nTranscrType ^= Number(this.encoding !== "UTF-32") <<
			 * 1;
			 */
			nStartIdx = nCharStart = nOffset ? Math.max((nOutptLen + nOffset) % nOutptLen, 0) : 0;
			nEndIdx = nCharEnd = (Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0) + nStartIdx, nOutptLen)
					: nOutptLen) - 1;

		} else { /* input is stringView */

			vSource = vInput.rawData;
			nInptLen = vInput.makeIndex();
			nStartIdx = nCharStart = nOffset ? Math.max((nInptLen + nOffset) % nInptLen, 0) : 0;
			nOutptLen = Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0), nInptLen - nCharStart) : nInptLen;
			nEndIdx = nCharEnd = nOutptLen + nCharStart;

			if (vInput.encoding === "UTF-8") {
				fGetInptChrSize = StringView.getUTF8CharLength;
				fGetInptChrCode = StringView.loadUTF8CharCode;
			} else if (vInput.encoding === "UTF-16") {
				fGetInptChrSize = StringView.getUTF16CharLength;
				fGetInptChrCode = StringView.loadUTF16CharCode;
			} else {
				nTranscrType &= 1;
			}

		}

		if (nOutptLen === 0 || nTranscrType < 4 && vSource.encoding === this.encoding && nCharStart === 0
				&& nOutptLen === nInptLen) {

			/*
			 * the encoding is the same, the length too and the offset is 0...
			 * or the input is empty!
			 */

			nTranscrType = 7;

		}

		conversionSwitch: switch (nTranscrType) {

		case 0:

			/*
			 * both the source and the new StringView have a fixed-length
			 * encoding...
			 */

			aWhole = new fTAView(nOutptLen);
			for (var nOutptIdx = 0; nOutptIdx < nOutptLen; aWhole[nOutptIdx] = vSource[nStartIdx + nOutptIdx++])
				;
			break conversionSwitch;

		case 1:

			/*
			 * the source has a fixed-length encoding but the new StringView has
			 * a variable-length encoding...
			 */

			/* mapping... */

			nOutptLen = 0;

			for (var nInptIdx = nStartIdx; nInptIdx < nEndIdx; nInptIdx++) {
				nOutptLen += fGetOutptChrSize(vSource[nInptIdx]);
			}

			aWhole = new fTAView(nOutptLen);

			/* transcription of the source... */

			for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx++) {
				nOutptIdx = fPutOutptCode(aWhole, vSource[nInptIdx], nOutptIdx);
			}

			break conversionSwitch;

		case 2:

			/*
			 * the source has a variable-length encoding but the new StringView
			 * has a fixed-length encoding...
			 */

			/* mapping... */

			nStartIdx = 0;

			var nChrCode;

			for (nChrIdx = 0; nChrIdx < nCharStart; nChrIdx++) {
				nChrCode = fGetInptChrCode(vSource, nStartIdx);
				nStartIdx += fGetInptChrSize(nChrCode);
			}

			aWhole = new fTAView(nOutptLen);

			/* transcription of the source... */

			for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode), nOutptIdx++) {
				nChrCode = fGetInptChrCode(vSource, nInptIdx);
				aWhole[nOutptIdx] = nChrCode;
			}

			break conversionSwitch;

		case 3:

			/*
			 * both the source and the new StringView have a variable-length
			 * encoding...
			 */

			/* mapping... */

			nOutptLen = 0;

			var nChrCode;

			for (var nChrIdx = 0, nInptIdx = 0; nChrIdx < nCharEnd; nInptIdx += fGetInptChrSize(nChrCode)) {
				nChrCode = fGetInptChrCode(vSource, nInptIdx);
				if (nChrIdx === nCharStart) {
					nStartIdx = nInptIdx;
				}
				if (++nChrIdx > nCharStart) {
					nOutptLen += fGetOutptChrSize(nChrCode);
				}
			}

			aWhole = new fTAView(nOutptLen);

			/* transcription... */

			for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode)) {
				nChrCode = fGetInptChrCode(vSource, nInptIdx);
				nOutptIdx = fPutOutptCode(aWhole, nChrCode, nOutptIdx);
			}

			break conversionSwitch;

		case 4:

			/* DOMString to ASCII or BinaryString or other unknown encodings */

			aWhole = new fTAView(nOutptLen);

			/* transcription... */

			for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
				aWhole[nIdx] = vSource.charCodeAt(nIdx) & 0xff;
			}

			break conversionSwitch;

		case 5:

			/* DOMString to UTF-8 or to UTF-16 */

			/* mapping... */

			nOutptLen = 0;

			for (var nMapIdx = 0; nMapIdx < nInptLen; nMapIdx++) {
				if (nMapIdx === nCharStart) {
					nStartIdx = nOutptLen;
				}
				nOutptLen += fGetOutptChrSize(vSource.charCodeAt(nMapIdx));
				if (nMapIdx === nCharEnd) {
					nEndIdx = nOutptLen;
				}
			}

			aWhole = new fTAView(nOutptLen);

			/* transcription... */

			for (var nOutptIdx = 0, nChrIdx = 0; nOutptIdx < nOutptLen; nChrIdx++) {
				nOutptIdx = fPutOutptCode(aWhole, vSource.charCodeAt(nChrIdx), nOutptIdx);
			}

			break conversionSwitch;

		case 6:

			/* DOMString to UTF-32 */

			aWhole = new fTAView(nOutptLen);

			/* transcription... */

			for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
				aWhole[nIdx] = vSource.charCodeAt(nIdx);
			}

			break conversionSwitch;

		case 7:

			aWhole = new fTAView(nOutptLen ? vSource : 0);
			break conversionSwitch;

		}

		aRaw = nTranscrType > 3 && (nStartIdx > 0 || nEndIdx < aWhole.length - 1) ? aWhole.subarray(nStartIdx, nEndIdx)
				: aWhole;

	}

	this.buffer = aWhole.buffer;
	this.bufferView = aWhole;
	this.rawData = aRaw;

	Object.freeze(this);

}

/* CONSTRUCTOR'S METHODS */

StringView.loadUTF8CharCode = function(aChars, nIdx) {

	var nLen = aChars.length, nPart = aChars[nIdx];

	return nPart > 251 && nPart < 254 && nIdx + 5 < nLen ?
	/* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
	/* six bytes */(nPart - 252) * 1073741824 + (aChars[nIdx + 1] - 128 << 24) + (aChars[nIdx + 2] - 128 << 18)
			+ (aChars[nIdx + 3] - 128 << 12) + (aChars[nIdx + 4] - 128 << 6) + aChars[nIdx + 5] - 128 : nPart > 247
			&& nPart < 252 && nIdx + 4 < nLen ?
	/* five bytes */(nPart - 248 << 24) + (aChars[nIdx + 1] - 128 << 18) + (aChars[nIdx + 2] - 128 << 12)
			+ (aChars[nIdx + 3] - 128 << 6) + aChars[nIdx + 4] - 128 : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ?
	/* four bytes */(nPart - 240 << 18) + (aChars[nIdx + 1] - 128 << 12) + (aChars[nIdx + 2] - 128 << 6)
			+ aChars[nIdx + 3] - 128 : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ?
	/* three bytes */(nPart - 224 << 12) + (aChars[nIdx + 1] - 128 << 6) + aChars[nIdx + 2] - 128 : nPart > 191
			&& nPart < 224 && nIdx + 1 < nLen ?
	/* two bytes */(nPart - 192 << 6) + aChars[nIdx + 1] - 128 :
	/* one byte */nPart;

};

StringView.putUTF8CharCode = function(aTarget, nChar, nPutAt) {

	var nIdx = nPutAt;

	if (nChar < 0x80 /* 128 */) {
		/* one byte */
		aTarget[nIdx++] = nChar;
	} else if (nChar < 0x800 /* 2048 */) {
		/* two bytes */
		aTarget[nIdx++] = 0xc0 /* 192 */+ (nChar >>> 6);
		aTarget[nIdx++] = 0x80 /* 128 */+ (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x10000 /* 65536 */) {
		/* three bytes */
		aTarget[nIdx++] = 0xe0 /* 224 */+ (nChar >>> 12);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x200000 /* 2097152 */) {
		/* four bytes */
		aTarget[nIdx++] = 0xf0 /* 240 */+ (nChar >>> 18);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x4000000 /* 67108864 */) {
		/* five bytes */
		aTarget[nIdx++] = 0xf8 /* 248 */+ (nChar >>> 24);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 18) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ (nChar & 0x3f /* 63 */);
	} else /* if (nChar <= 0x7fffffff) */{ /* 2147483647 */
		/* six bytes */
		aTarget[nIdx++] = 0xfc /* 252 */+ /*
											 * (nChar >>> 32) is not possible in
											 * ECMAScript! So...:
											 */(nChar / 1073741824);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 24) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 18) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */+ (nChar & 0x3f /* 63 */);
	}

	return nIdx;

};

StringView.getUTF8CharLength = function(nChar) {
	return nChar < 0x80 ? 1 : nChar < 0x800 ? 2 : nChar < 0x10000 ? 3 : nChar < 0x200000 ? 4 : nChar < 0x4000000 ? 5
			: 6;
};

StringView.loadUTF16CharCode = function(aChars, nIdx) {

	/* UTF-16 to DOMString decoding algorithm */
	var nFrstChr = aChars[nIdx];

	return nFrstChr > 0xD7BF /* 55231 */&& nIdx + 1 < aChars.length ? (nFrstChr - 0xD800 /* 55296 */<< 10)
			+ aChars[nIdx + 1] + 0x2400 /* 9216 */
	: nFrstChr;

};

StringView.putUTF16CharCode = function(aTarget, nChar, nPutAt) {

	var nIdx = nPutAt;

	if (nChar < 0x10000 /* 65536 */) {
		/* one element */
		aTarget[nIdx++] = nChar;
	} else {
		/* two elements */
		aTarget[nIdx++] = 0xD7C0 /* 55232 */+ (nChar >>> 10);
		aTarget[nIdx++] = 0xDC00 /* 56320 */+ (nChar & 0x3FF /* 1023 */);
	}

	return nIdx;

};

StringView.getUTF16CharLength = function(nChar) {
	return nChar < 0x10000 ? 1 : 2;
};

/* Array of bytes to base64 string decoding */

StringView.b64ToUint6 = function(nChr) {

	return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4
			: nChr === 43 ? 62 : nChr === 47 ? 63 : 0;

};

StringView.uint6ToB64 = function(nUint6) {

	return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43
			: nUint6 === 63 ? 47 : 65;

};

/* Base64 string to array encoding */

StringView.bytesToBase64 = function(aBytes) {

	var sB64Enc = "";

	for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
		nMod3 = nIdx % 3;
		if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) {
			sB64Enc += "\r\n";
		}
		nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
		if (nMod3 === 2 || aBytes.length - nIdx === 1) {
			sB64Enc += String.fromCharCode(StringView.uint6ToB64(nUint24 >>> 18 & 63), StringView
					.uint6ToB64(nUint24 >>> 12 & 63), StringView.uint6ToB64(nUint24 >>> 6 & 63), StringView
					.uint6ToB64(nUint24 & 63));
			nUint24 = 0;
		}
	}

	return sB64Enc.replace(/A(?=A$|$)/g, "=");

};

StringView.base64ToBytes = function(sBase64, nBlockBytes) {

	var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length, nOutLen = nBlockBytes ? Math
			.ceil((nInLen * 3 + 1 >>> 2) / nBlockBytes)
			* nBlockBytes : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= StringView.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}

	return aBytes;

};

StringView.makeFromBase64 = function(sB64Inpt, sEncoding, nByteOffset, nLength) {

	return new StringView(sEncoding === "UTF-16" || sEncoding === "UTF-32" ? StringView.base64ToBytes(sB64Inpt,
			sEncoding === "UTF-16" ? 2 : 4).buffer : StringView.base64ToBytes(sB64Inpt), sEncoding, nByteOffset,
			nLength);

};

/* DEFAULT VALUES */

StringView.prototype.encoding = "UTF-8"; /* Default encoding... */

/* INSTANCES' METHODS */

StringView.prototype.makeIndex = function(nChrLength, nStartFrom) {

	var

	aTarget = this.rawData, nChrEnd, nRawLength = aTarget.length, nStartIdx = nStartFrom || 0, nIdxEnd = nStartIdx, nStopAtChr = isNaN(nChrLength) ? Infinity
			: nChrLength;

	if (nChrLength + 1 > aTarget.length) {
		throw new RangeError(
				"StringView.prototype.makeIndex - The offset can\'t be major than the length of the array - 1.");
	}

	switch (this.encoding) {

	case "UTF-8":

		var nPart;

		for (nChrEnd = 0; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
			nPart = aTarget[nIdxEnd];
			nIdxEnd += nPart > 251 && nPart < 254 && nIdxEnd + 5 < nRawLength ? 6 : nPart > 247 && nPart < 252
					&& nIdxEnd + 4 < nRawLength ? 5 : nPart > 239 && nPart < 248 && nIdxEnd + 3 < nRawLength ? 4
					: nPart > 223 && nPart < 240 && nIdxEnd + 2 < nRawLength ? 3 : nPart > 191 && nPart < 224
							&& nIdxEnd + 1 < nRawLength ? 2 : 1;
		}

		break;

	case "UTF-16":

		for (nChrEnd = nStartIdx; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
			nIdxEnd += aTarget[nIdxEnd] > 0xD7BF /* 55231 */&& nIdxEnd + 1 < aTarget.length ? 2 : 1;
		}

		break;

	default:

		nIdxEnd = nChrEnd = isFinite(nChrLength) ? nChrLength : nRawLength - 1;

	}

	if (nChrLength) {
		return nIdxEnd;
	}

	return nChrEnd;

};

StringView.prototype.toBase64 = function(bWholeBuffer) {

	return StringView.bytesToBase64(bWholeBuffer ? (this.bufferView.constructor === Uint8Array ? this.bufferView
			: new Uint8Array(this.buffer)) : this.rawData.constructor === Uint8Array ? this.rawData : new Uint8Array(
			this.buffer, this.rawData.byteOffset, this.rawData.length << (this.rawData.constructor === Uint16Array ? 1
					: 2)));

};

StringView.prototype.subview = function(nCharOffset /* optional */, nCharLength /* optional */) {

	var

	nChrLen, nCharStart, nStrLen, bVariableLen = this.encoding === "UTF-8" || this.encoding === "UTF-16", nStartOffset = nCharOffset, nStringLength, nRawLen = this.rawData.length;

	if (nRawLen === 0) {
		return new StringView(this.buffer, this.encoding);
	}

	nStringLength = bVariableLen ? this.makeIndex() : nRawLen;
	nCharStart = nCharOffset ? Math.max((nStringLength + nCharOffset) % nStringLength, 0) : 0;
	nStrLen = Number.isInteger(nCharLength) ? Math.max(nCharLength, 0) + nCharStart > nStringLength ? nStringLength
			- nCharStart : nCharLength : nStringLength;

	if (nCharStart === 0 && nStrLen === nStringLength) {
		return this;
	}

	if (bVariableLen) {
		nStartOffset = this.makeIndex(nCharStart);
		nChrLen = this.makeIndex(nStrLen, nStartOffset) - nStartOffset;
	} else {
		nStartOffset = nCharStart;
		nChrLen = nStrLen - nCharStart;
	}

	if (this.encoding === "UTF-16") {
		nStartOffset <<= 1;
	} else if (this.encoding === "UTF-32") {
		nStartOffset <<= 2;
	}

	return new StringView(this.buffer, this.encoding, nStartOffset, nChrLen);

};

StringView.prototype.forEachChar = function(fCallback, oThat, nChrOffset, nChrLen) {

	var aSource = this.rawData, nRawEnd, nRawIdx;

	if (this.encoding === "UTF-8" || this.encoding === "UTF-16") {

		var fGetInptChrSize, fGetInptChrCode;

		if (this.encoding === "UTF-8") {
			fGetInptChrSize = StringView.getUTF8CharLength;
			fGetInptChrCode = StringView.loadUTF8CharCode;
		} else if (this.encoding === "UTF-16") {
			fGetInptChrSize = StringView.getUTF16CharLength;
			fGetInptChrCode = StringView.loadUTF16CharCode;
		}

		nRawIdx = isFinite(nChrOffset) ? this.makeIndex(nChrOffset) : 0;
		nRawEnd = isFinite(nChrLen) ? this.makeIndex(nChrLen, nRawIdx) : aSource.length;

		for (var nChrCode, nChrIdx = 0; nRawIdx < nRawEnd; nChrIdx++) {
			nChrCode = fGetInptChrCode(aSource, nRawIdx);
			fCallback.call(oThat || null, nChrCode, nChrIdx, nRawIdx, aSource);
			nRawIdx += fGetInptChrSize(nChrCode);
		}

	} else {

		nRawIdx = isFinite(nChrOffset) ? nChrOffset : 0;
		nRawEnd = isFinite(nChrLen) ? nChrLen + nRawIdx : aSource.length;

		for (nRawIdx; nRawIdx < nRawEnd; nRawIdx++) {
			fCallback.call(oThat || null, aSource[nRawIdx], nRawIdx, nRawIdx, aSource);
		}

	}

};

StringView.prototype.valueOf = StringView.prototype.toString = function() {

	if (this.encoding !== "UTF-8" && this.encoding !== "UTF-16") {
		/* ASCII, UTF-32 or BinaryString to DOMString */
		return String.fromCharCode.apply(null, this.rawData);
	}

	var fGetCode, fGetIncr, sView = "";

	if (this.encoding === "UTF-8") {
		fGetIncr = StringView.getUTF8CharLength;
		fGetCode = StringView.loadUTF8CharCode;
	} else if (this.encoding === "UTF-16") {
		fGetIncr = StringView.getUTF16CharLength;
		fGetCode = StringView.loadUTF16CharCode;
	}

	for (var nChr, nLen = this.rawData.length, nIdx = 0; nIdx < nLen; nIdx += fGetIncr(nChr)) {
		nChr = fGetCode(this.rawData, nIdx);
		sView += String.fromCharCode(nChr);
	}

	return sView;

};
"use strict"

// Some helper functions to deal with the camera math: Note the these
// operate on vectors represented as JavaScript objects {x:, y:, z:} not
// arrays or typed arrays.
var vecCrossProduct = function(a, b) {
	var r = SceneJS_math_cross3Vec3([ a.x, a.y, a.z ], [ b.x, b.y, b.z ]);
	return {
		x : r[0],
		y : r[1],
		z : r[2]
	};
};
var vecMultiplyScalar = function(a, m) {
	return {
		x : a.x * m,
		y : a.y * m,
		z : a.z * m
	};
};
var vecSubtract = function(a, b) {
	return {
		x : a.x - b.x,
		y : a.y - b.y,
		z : a.z - b.z
	};
};
var vecMagnitude = function(v) {
	var x = v.x, y = v.y, z = v.z;
	return Math.sqrt(x * x + y * y + z * z);
};
var vecNormalize = function(v) {
	return vecMultiplyScalar(v, 1 / vecMagnitude(v));
};
var vecNegate = function(v) {
	return {
		x : -v.x,
		y : -v.y,
		z : -v.z
	};
};
var vecAdd = function(a, b) {
	return {
		x : a.x + b.x,
		y : a.y + b.y,
		z : a.z + b.z
	};
};

/**
 * Class: BIMSURFER.Control.PickFlyOrbit Control to control the main camera of
 * the scene. Allows the user to pan, orbit and zoom-in.
 */
BIMSURFER.Control.PickFlyOrbit = BIMSURFER.Class(BIMSURFER.Control, {
	CLASS : "BIMSURFER.Control.PickFlyOrbit",

	touching : false,
	orbitDragging : false,
	panDragging : false,
	orbiting : false,
	flying : false,
	panning : false,
	lastX : null,
	lastY : null,
	downX : null,
	downY : null,

	direction : 1,
	yaw : 0,
	pitch : 0,
	zoom : 0,
	prevZoom : 0,

	scale : 1,
	prevScale : 1,

	rate : 40,

	lookAt : null,
	startEye : {
		x : 0,
		y : 0,
		z : 0
	},
	eye : {
		x : 0,
		y : 0,
		z : 0
	},
	look : {
		x : 0,
		y : 0,
		z : 0
	},

	startPivot : {
		x : 0,
		y : 0,
		z : 0
	},
	endPivot : {
		x : 0,
		y : 0,
		z : 0
	},
	currentPivot : {
		x : 0,
		y : 0,
		z : 0
	},

	flightStartTime : null,
	flightDuration : null,

	/**
	 * Consturctor
	 * 
	 * @constructor
	 * @param {object}
	 *            params Options
	 */
	__construct : function(params) {
		this.events = new BIMSURFER.Events(this);
		if (BIMSURFER.Util.isset(params)) {
			this.eye = params.eye || this.eye;
			this.look = params.look || this.look;
			this.zoom = params.zoom || this.zoom;
		}
	},

	/**
	 * Activates the control
	 * 
	 * @return this
	 */
	activate : function() {
		if (this.SYSTEM == null || !this.SYSTEM.sceneLoaded) {
			console.error('Cannot activate ' + this.CLASS + ': Surfer or scene not ready');
			return null;
		}

		this.lookAt = this.SYSTEM.scene.findNode('main-lookAt');
		this.lookAtOrig = this.obtainView();
		this.eye = this.lookAt.getEye();
		this.startEye = this.lookAt.getEye();

		this.rate = Math.abs(this.eye.z) / 500;

		this.look = this.lookAt.getLook();
		this.currentPivot = this.look;
		this.active = true;
		this.initEvents();
		this.events.trigger('activated');
		return this;
	},

	/**
	 * Deactivates the control
	 * 
	 * @return this
	 */
	deactivate : function() {
		this.active = false;
		this.initEvents();
		this.events.trigger('deactivated');
		return this;
	},

	/**
	 * Initializes the events necessary for the operation of this control
	 * 
	 * @return this
	 */
	initEvents : function() {
		if (this.active) {
			this.SYSTEM.events.register('mouseDown', this.mouseDown, this);
			this.SYSTEM.events.register('mouseUp', this.mouseUp, this);
			this.SYSTEM.events.register('mouseMove', this.mouseMove, this);
			this.SYSTEM.events.register('mouseWheel', this.mouseWheel, this);
			this.SYSTEM.events.register('DOMMouseScroll', this.mouseWheel, this);
			this.SYSTEM.events.register('touchStart', this.touchStart, this);
			this.SYSTEM.events.register('touchMove', this.touchMove, this);
			this.SYSTEM.events.register('touchEnd', this.touchEnd, this);
			this.SYSTEM.events.register('pick', this.pick, this);
			this.SYSTEM.events.register('tick', this.tick, this);
			this.SYSTEM.events.register('touchPinch', this.touchPinch, this);
			this.SYSTEM.events.register('touchPan', this.touchPan, this);
		} else {
			this.SYSTEM.events.unregister('mouseDown', this.mouseDown, this);
			this.SYSTEM.events.unregister('mouseUp', this.mouseUp, this);
			this.SYSTEM.events.unregister('mouseMove', this.mouseMove, this);
			this.SYSTEM.events.unregister('mouseWheel', this.mouseWheel, this);
			this.SYSTEM.events.unregister('touchStart', this.touchStart, this);
			this.SYSTEM.events.unregister('touchMove', this.touchMove, this);
			this.SYSTEM.events.unregister('touchEnd', this.touchEnd, this);
			this.SYSTEM.events.unregister('pick', this.pick, this);
			this.SYSTEM.events.unregister('tick', this.tick, this);
			this.SYSTEM.events.unregister('touchPinch', this.touchPinch, this);
			this.SYSTEM.events.unregister('touchPan', this.touchPan, this);
		}
		return this;
	},

	ease : function(t, b, c, d) {
		b = b || 0;
		c = c || 1;
		d = d || 1;
		var ts = (t /= d) * t;
		var tc = ts * t;
		return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
	},

	lerp : function(a, b, p) {
		return a + (b - a) * p;
	},

	lerp3 : function(dest, a, b, p) {
		for (var i = 0; i < 3; ++i) {
			var component = String.fromCharCode('x'.charCodeAt(0) + i);
			dest[component] = this.lerp(a[component], b[component], p);
		}
	},

	updateTimer : function() {
		// TODO: Use HTML5 Animation Frame
		this.timeNow = +new Date();
		if (this.flightStartTime === null) {
			this.flightStartTime = this.timeNow;
		}
		this.timeElapsed = this.timeNow - this.flightStartTime;
		this.timeElapsedNormalized = Math.min(this.timeElapsed / this.flightDuration, 1.0);
		if (this.timeElapsed >= this.flightDuration) {
			this.flying = false;
			this.flightStartTime = null;

			this.rotating = false;
			this.startYaw = this.startPitch = this.endYaw = this.endPitch = null;
		}
	},

	sphericalCoords : function(eye) {
		var r = vecMagnitude(eye);
		var phi = Math.acos(eye.z / r);
		var theta = Math.atan2(eye.y, eye.x);
		return {
			phi : phi,
			theta : theta
		};
	},

	/**
	 * Event listener for every SceneJS tick
	 */
	tick : function() {
		if (this.flying) {
			this.updateTimer();
			var easedTime = this.ease(this.timeElapsedNormalized);
			this.lerp3(this.currentPivot, this.startPivot, this.endPivot, easedTime);
			// Need to rotate lookat
			this.orbiting = true;

			if (this.rotating) {
				this.pitch = this.lerp(this.startPitch, this.endPitch, easedTime);
				this.yaw = this.lerp(this.startYaw, this.endYaw, easedTime);
			}
		}
		if (this.orbiting) {
			var radius = vecMagnitude(this.startEye);

			var phiTheta = this.sphericalCoords(this.startEye);
			var startPhi = phiTheta.phi;
			var startTheta = phiTheta.theta;

			var PI_2 = 2 * Math.PI;

			var phi = this.pitch * BIMSURFER.Constants.camera.orbitSpeedFactor + startPhi;

			while (phi > PI_2)
				phi -= PI_2;
			while (phi < 0)
				phi += PI_2;

			if (phi > Math.PI) {
				if (this.direction != -1) {
					this.direction = -1;
					this.lookAt.set('up', {
						x : 0,
						y : 0,
						z : -1
					});
				}
			} else {
				if (this.direction != 1) {
					this.direction = 1;
					this.lookAt.set('up', {
						x : 0,
						y : 0,
						z : 1
					});
				}
			}

			var theta = this.yaw * BIMSURFER.Constants.camera.orbitSpeedFactor + startTheta;
			var x = radius * Math.sin(phi) * Math.cos(theta);
			var y = radius * Math.sin(phi) * Math.sin(theta);
			var z = radius * Math.cos(phi);

			var zoomX = x * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;
			var zoomY = y * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;
			var zoomZ = z * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;

			if ((x >= 0 && zoomX > x) || (x < 0 && zoomX < x) || (y >= 0 && zoomY > y) || (y < 0 && zoomY < y)
					|| (z >= 0 && zoomZ > z) || (z < 0 && zoomZ < z)) {
				this.zoom = this.prevZoom;
				zoomX = x * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;
				zoomY = y * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;
				zoomZ = z * this.zoom * BIMSURFER.Constants.camera.zoomSpeedFactor;
			}

			x -= zoomX;
			y -= zoomY;
			z -= zoomZ;

			this.prevZoom = this.zoom;

			x += this.currentPivot.x;
			y += this.currentPivot.y;
			z += this.currentPivot.z;

			this.eye = {
				x : x,
				y : y,
				z : z
			};

			// Update view
			var origEye = this.lookAt.getEye();
			var origLook = this.lookAt.getLook();
			var origUp = this.lookAt.getUp();
			this.lookAt.setLook(this.currentPivot);
			this.lookAt.setEye(this.eye);

			this.orbiting = false;
		}
		if (this.panning) {

			this.lookAt.setLook(this.currentPivot);
			this.lookAt.setEye(this.eye);

			this.panning = false;
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {SceneJS.node}
	 *            hit Selected SceneJS node
	 */
	pick : function(hit) {
		// Some plugins wrap things in this name to
		// avoid them being picked, such as skyboxes
		if (hit.name == "__SceneJS_dontPickMe") {
			return;
		}

		this.startPivot = {
			x : this.currentPivot.x,
			y : this.currentPivot.y,
			z : this.currentPivot.z
		};
		this.endPivot = {
			x : hit.worldPos[0],
			y : hit.worldPos[1],
			z : hit.worldPos[2]
		};
		var dif = {
			x : this.endPivot.x - this.startPivot.x,
			y : this.endPivot.y - this.startPivot.y,
			z : this.endPivot.z - this.startPivot.z
		};

		var flightDist = Math.sqrt(dif.x * dif.x + dif.y * dif.y + dif.z * dif.z);

		this.flightStartTime = null;
		this.flightDuration = 1000.0 * ((flightDist / 15000) + 1); // extra
		// seconds
		// to ensure
		// arrival

		this.flying = true;
	},

	/**
	 * @return {Object} a structure containing eye point, view direction and up
	 *         vector
	 */
	obtainView : function() {
		var eye = this.lookAt.getEye();
		var tgt = this.lookAt.getLook();
		var up = this.lookAt.getUp();

		var dir = vecNormalize(vecSubtract(tgt, eye));
		up = vecCrossProduct(vecCrossProduct(dir, up), dir);
		up = vecNormalize(up);

		return {
			eye : eye,
			dir : dir,
			up : up
		};
	},

	/**
	 * @param {Object}
	 *            a structure containing eye point, view direction and up vector
	 */
	restoreView : function(lookat) {
		// Set the current camera orientation as our initial one and
		// transition to the new one. The lookat structure does not
		// contain the distance from camera to target so the end pivot
		// will be set the same distance from the camera as it is now.

		var l = vecMagnitude(vecSubtract(this.eye, this.currentPivot));

		var cy = vecSubtract(this.eye, this.currentPivot);
		this.startEye = {
			x : cy.x,
			y : cy.y,
			z : cy.z
		};

		var currentPT = this.sphericalCoords(this.startEye);
		var eventualPT = this.sphericalCoords(vecNegate(lookat.dir));

		this.endYaw = (eventualPT.theta - currentPT.theta) / BIMSURFER.Constants.camera.orbitSpeedFactor;
		this.endPitch = (eventualPT.phi - currentPT.phi) / BIMSURFER.Constants.camera.orbitSpeedFactor;
		this.rotating = true;

		this.startYaw = this.startPitch = this.yaw = this.pitch = 0;
		this.zoom = this.prevZoom = 0;
		this.startPivot = {
			x : this.currentPivot.x,
			y : this.currentPivot.y,
			z : this.currentPivot.z
		};
		this.endPivot = vecSubtract(lookat.eye, vecNegate(vecMultiplyScalar(lookat.dir, l)));

		this.flightStartTime = null;
		this.flightDuration = 1000;
		this.flying = true;
	},

	/**
	 * Handler for mouse and touch drag events
	 * 
	 * @param {Number}
	 *            x X coordinate
	 * @param {Number}
	 *            y Y coordinate
	 */
	actionMove : function(x, y) {
		if (this.orbitDragging) {
			this.yaw -= (x - this.lastX) * this.direction * 0.1;
			this.pitch -= (y - this.lastY) * 0.1;
			this.orbiting = true;
		} else if (this.panDragging) {

			var rate = this.rate;

			var eye = this.lookAt.getEye();
			var look = this.currentPivot;
			// var look = this.lookAt.getLook();
			var up = vecNormalize(this.lookAt.getUp());

			var forward = vecNormalize(vecSubtract({
				x : look.x,
				y : look.y,
				z : look.z
			}, {
				x : eye.x,
				y : eye.y,
				z : eye.z
			}));
			var axis = vecCrossProduct(up, forward);
			up = vecNormalize(vecCrossProduct(axis, forward));
			var right = vecNormalize(vecCrossProduct(forward, up));

			var moveX = vecMultiplyScalar(right, (x - this.lastX) * rate);
			var moveY = vecMultiplyScalar(up, -1 * (y - this.lastY) * rate);
			var move = vecAdd(moveX, moveY);

			this.currentPivot = vecAdd({
				x : look.x,
				y : look.y,
				z : look.z
			}, move);
			// this.look = vecAdd({ x: look.x, y: look.y, z: look.z }, move);
			this.eye = vecAdd({
				x : eye.x,
				y : eye.y,
				z : eye.z
			}, move);

			this.panning = true;
		}

		this.lastX = x;
		this.lastY = y;
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseDown : function(e) {
		this.lastX = this.downX = e.offsetX;
		this.lastY = this.downY = e.offsetY;
		if (e.which == 1) { // Left click
			this.orbitDragging = true;
		}
		if (e.which == 2 || e.which == 3) { // Middle, Right click
			this.panDragging = true;

			e.preventDefault();
			e.stopPropagation();
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseUp : function(e) {
		this.orbitDragging = false;
		this.panDragging = false;
		if (e.which == 2 || e.which == 3) {
			e.preventDefault();
			e.stopPropagation();
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseMove : function(e) {
		if (!this.touching) {
			this.actionMove(e.offsetX, e.offsetY);
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseWheel : function(e) {
		var delta = 0;
		var event = e;
		if (event.wheelDelta) {
			delta = event.wheelDelta / 120;
			if (window.opera) {
				delta = -delta;
			}
		} else if (event.detail) {
			delta = -event.detail / 3;
		}

		if (delta) {
			if (delta < 0 && this.zoom > -25) {
				this.zoom -= 1;
			} else if (delta > 0) {
				this.zoom += 1;
			}
		}

		if (event.preventDefault) {
			event.preventDefault();
		}

		event.preventDefault();
		this.orbiting = true;
	},

	/**
	 * Event listener
	 * 
	 * @param {touchEvent}
	 *            e Touch event
	 */
	touchStart : function(e) {
		if (e.targetTouches.length == 1) {
			this.lastX = this.downX = e.targetTouches[0].clientX;
			this.lastY = this.downY = e.targetTouches[0].clientY;
			this.orbitDragging = true;
			this.touching = true;
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {touchEvent}
	 *            e Touch event
	 */
	touchMove : function(e) {
		if (e.targetTouches.length == 1) {
			this.actionMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {touchEvent}
	 *            e Touch event
	 */
	touchEnd : function(e) {
		if (e.targetTouches.length == 1) {
			this.orbitDragging = false;
			this.panDragging = false;
			this.touching = false;
		} else {
			this.prevScale = 1;
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {touchEvent}
	 *            e Touch event
	 */
	touchPinch : function(e) {
		var delta = 0;
		var event = e;
		if (event.scale) {
			this.scale = event.scale;
			delta = this.prevScale - this.scale;
		}

		if (delta) {
			if (delta > 0.1 && this.zoom > -25) {
				this.zoom -= 1;
				this.prevScale = this.scale;
			} else if (delta < -0.1) {
				this.zoom += 1;
				this.prevScale = this.scale;
			}
		}

		if (event.preventDefault) {
			event.preventDefault();
		}

		event.preventDefault();
		this.orbiting = true;
	},

	/**
	 * Event listener
	 * 
	 * @param {touchEvent}
	 *            e Touch event
	 */
	touchPan : function(e) {
		this.orbitDragging = false;
		this.panDragging = true;
		this.actionMove(this.downX + e.deltaX, this.downY + e.deltaY);
		this.panDragging = false;
	},

});
"use strict"

/**
 * Class: BIMSURFER.Control.ClickSelect Control to select and hightlight a Scene
 * JS by clicking on it.
 */
BIMSURFER.Control.ClickSelect = BIMSURFER.Class(BIMSURFER.Control, {
	CLASS : "BIMSURFER.Control.ClickSelect",

	/**
	 * X coordinate of the last mouse event
	 */
	downX : null,

	/**
	 * Y coordinate of the last mouse event
	 */
	downY : null,

	active : false,

	/**
	 * The selected and highlighted SceneJS node
	 */
	highlighted : null,

	/**
	 * Timestamp of the last selection
	 */
	lastSelected : 0,

	/**
	 * Constructor.
	 * 
	 * @constructor
	 */
	__construct : function() {
		this.events = new BIMSURFER.Events(this);
	},

	/**
	 * Activates the contol
	 */
	activate : function() {
		if (this.SYSTEM == null || !this.SYSTEM.sceneLoaded) {
			console.error('Cannot activate ' + this.CLASS + ': Surfer or scene not ready');
			return null;
		}
		if (!this.active) {
			this.active = true;
			this.initEvents();
			this.events.trigger('activated');
		}
		return this;
	},

	/**
	 * Initializes the events necessary for the operation of this control
	 * 
	 * @return this
	 */
	initEvents : function() {
		if (this.active) {
			this.SYSTEM.events.register('pick', this.pick, this);
			this.SYSTEM.events.register('mouseDown', this.mouseDown, this);
			this.SYSTEM.events.register('mouseUp', this.mouseUp, this);
		} else {
			this.SYSTEM.events.unregister('pick', this.pick, this);
			this.SYSTEM.events.unregister('mouseDown', this.mouseDown, this);
			this.SYSTEM.events.unregister('mouseUp', this.mouseUp, this);
		}
		return this;
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseDown : function(e) {
		this.downX = e.offsetX;
		this.downY = e.offsetY;
	},

	/**
	 * Event listener
	 * 
	 * @param {mouseEvent}
	 *            e Mouse event
	 */
	mouseUp : function(e) {
		if (((e.offsetX > this.downX) ? (e.offsetX - this.downX < 5) : (this.downX - e.offsetX < 5))
				&& ((e.offsetY > this.downY) ? (e.offsetY - this.downY < 5) : (this.downY - e.offsetY < 5))) {
			if (Date.now() - this.lastSelected > 10) {
				this.unselect();
			}
		}
	},

	/**
	 * Event listener
	 * 
	 * @param {SceneJS.node}
	 *            hit Selected SceneJS node
	 */
	pick : function(hit) {
		this.unselect();
		this.highlighted = this.SYSTEM.scene.findNode(hit.nodeId);
		var groupId = this.highlighted.findParentByType("translate").data.groupId;

		var matrix = this.highlighted.nodes[0];
		var geometryNode = matrix.nodes[0];

		if (geometryNode._core.arrays.colors != null) {
			var geometry = {
				type : "geometry",
				primitive : "triangles"
			};

			geometry.coreId = geometryNode.getCoreId() + "Highlighted";
			geometry.indices = geometryNode._core.arrays.indices;
			geometry.positions = geometryNode._core.arrays.positions;
			geometry.normals = geometryNode._core.arrays.normals;

			geometry.colors = [];
			for (var i = 0; i < geometryNode._core.arrays.colors.length; i += 4) {
				geometry.colors[i] = 0;
				geometry.colors[i + 1] = 1;
				geometry.colors[i + 2] = 0;
				geometry.colors[i + 3] = 1;
			}

			var library = this.SYSTEM.scene.findNode("library-" + groupId);
			library.add("node", geometry);

			var newGeometry = {
				type : "geometry",
				coreId : geometryNode.getCoreId() + "Highlighted"
			}

			matrix.removeNode(geometryNode);
			matrix.addNode(newGeometry);
		}

		this.highlighted.insert('node', BIMSURFER.Constants.highlightSelectedObject);
		this.lastSelected = Date.now();
		var o = this;
		window.setTimeout(function() {
			o.events.trigger('select', [ groupId, o.highlighted ]);
		}, 0);
	},

	/**
	 * Event listener
	 */
	unselect : function() {
		var highlighted = this.SYSTEM.scene.findNode(BIMSURFER.Constants.highlightSelectedObject.id);
		if (highlighted != null) {
			var groupId = highlighted.findParentByType("translate").data.groupId;
			if (highlighted != null) {
				var matrix = highlighted.nodes[0];
				var geometryNode = matrix.nodes[0];

				if (geometryNode._core.arrays.colors != null) {
					matrix.removeNode(geometryNode);

					var newGeometry = {
						type : "geometry",
						coreId : geometryNode.getCoreId().replace("Highlighted", "")
					}

					matrix.addNode(newGeometry);
				}

				highlighted.splice();

				this.events.trigger('unselect', [
						this.highlighted == null ? null : this.highlighted.findParentByType("translate").groupId,
						this.highlighted ]);
				this.highlighted = null;
			}
		}
	}
});
"use strict"

/**
 * Class: BIMSURFER.Light This is the base class for Light objects. Lights can
 * be used to modify the lighting in the viewer
 */
BIMSURFER.Light = BIMSURFER.Class({
	CLASS : 'BIMSURFER.Light',
	SYSTEM : null,
	lightObject : null,
	__construct : function() {
	},
	activate : function() {
		var myLights = this.SYSTEM.scene.findNode('my-lights');
		var lights = myLights._core.lights;

		if (BIMSURFER.Util.isArray(this.lightObject)) {
			for (var i = 0; i < this.lightObject.length; i++) {
				if (lights.indexOf(this.lightObject[i]) == -1) {
					lights.push(this.lightObject[i]);
				}
			}
		} else if (lights.indexOf(this.lightObject) == -1) {
			lights.push(this.lightObject);
		}
		myLights.setLights(lights);
	},
	deactivate : function() {
		var myLight = this.SYSTEM.scene.findNode('my-lights');
		var lights = myLights._core.lights;

		var i = -1;
		if (BIMSURFER.Util.isArray(this.lightObject)) {
			for (i = 0; i < this.lightObject.length; i++) {
				var y = lights.indexOf(this.lightObject[i]);
				if (y > -1) {
					lights.splice(y, 1);
				}
			}
		} else if (i = lights.indexOf(this.lightObject) > -1) {
			lights.splice(i, 1);
		}
		myLights.setLights(lights);
	},

	setViewer : function(viewer) {
		this.SYSTEM = viewer;
	}
});
"use strict"

/**
 * Class: BIMSURFER.Light.Camera This light mimics the sunlight
 */
BIMSURFER.Light.Sun = BIMSURFER.Class(BIMSURFER.Light, {
	CLASS : 'BIMSURFER.Light.Sun',
	__construct : function(system) {
		this.SYSTEM = system;
		this.lightObject = {
			type : 'light',
			id : 'sun-light',
			mode : 'dir',
			color : {
				r : 0.8,
				g : 0.8,
				b : 0.8
			},
			dir : {
				x : -0.5,
				y : 0.5,
				z : -1.0
			},
			diffuse : true,
			specular : true
		};
	}
});

"use strict"

/**
 * Class: BIMSURFER.Light.Camera This light will allways be behind the camera
 * and pointed to the middle of the model
 */
BIMSURFER.Light.Camera = BIMSURFER.Class(BIMSURFER.Light, {
	CLASS : 'BIMSURFER.Light.Camera',
	__construct : function(system) {
		this.SYSTEM = system;
		this.lightObject = {
			type : 'light',
			id : 'sun-light',
			mode : 'dir',
			color : {
				r : 1,
				g : 1,
				b : 1
			},
			dir : {
				x : -0.5,
				y : -0.5,
				z : -1.0
			},
			space : 'world',
			diffuse : true,
			specular : true
		};
	}
});
"use strict"

/**
 * Class: BIMSURFER.Light.Ambient Default ambient light
 */
BIMSURFER.Light.Ambient = BIMSURFER.Class(BIMSURFER.Light, {
	CLASS : 'BIMSURFER.Light.Ambient',
	__construct : function(system) {
		this.SYSTEM = system;
		this.lightObject = new Array({
			mode : "ambient",
			color : {
				r : 0.3,
				g : 0.3,
				b : 0.3
			},
			diffuse : false,
			specular : false
		}, {
			mode : "dir",
			color : {
				r : 1.0,
				g : 1.0,
				b : 1.0
			},
			diffuse : true,
			specular : true,
			dir : {
				x : -0.5,
				y : -0.5,
				z : -1.0
			},
			space : "view"
		});
	}
});