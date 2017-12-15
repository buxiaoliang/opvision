(function() {
	Ext
			.define("CMDBuild.view.management.classes.map.navigationTree.ViewTree",
					{
						extend : "Ext.tree.Panel",

						oldCard : undefined,
						initialized : false,
						active : undefined,
						/**
						 * 
						 * @property {CMDBuild.controller.management.classes.map.NavigationTreeDelegate}
						 * 
						 */
						delegate : undefined,

						/**
						 * 
						 * @property {CMDBuild.view.management.classes.map.navigationTree.AbstractTree}
						 * 
						 */
						abstractTree : undefined,

						/**
						 * 
						 * @property { className : { cardId : navigable } }
						 */
						cache : {},
						blockedExpanding : undefined,
						constructor : function() {
							this.callParent(arguments);
						},

						initComponent : function() {
							this.activationCount = 0;
							var me = this;
							var SHOW_ICON = 'images/icons/bullet_go.png';
							var HIDE_ICON = 'images/icons/cancel.png';

							this.columns = [ {
								xtype : 'treecolumn',
								flex : 2,
								sortable : false,
								dataIndex : 'text',
								menuDisabled : true
							}, {
								width : 40,
								menuDisabled : true,
								xtype : 'actioncolumn',
								tooltip : CMDBuild.Translation.management.modcard.open_relation,
								align : 'center',
								sortable : false,
								icon : 'images/icons/bullet_go.png',
								handler : function(grid, rowIndex, colIndex, actionItem, event, record, row) {
									var className = record.get("className");
									if (className !== "") {
										me.navigateOnCard(record);
									}
								},
								isDisabled : function(view, rowIdx, colIdx, item, record) {
									return false;
								}
							} ];
							this.abstractTree = Ext
									.create('CMDBuild.view.management.classes.map.navigationTree.AbstractTree');
							this.abstractTree.setInteractionDocument(this.interactionDocument);
							this.concreteTree = Ext
									.create('CMDBuild.view.management.classes.map.navigationTree.ConcreteTree');
							this.concreteTree.setInteractionDocument(this.interactionDocument);
							this.concreteTree.setAbstractTree(this.abstractTree);
							this.interactionDocument.observe(this);
							this.interactionDocument.observeCard(this);
							this.mon(this, "deactivate", function(treePanel) {
								this.active = false;
							}, this);
							this.mon(this, "activate", function(treePanel, p2, p3) {
								this.active = true;
								if (this.initialized !== true) {
									this.initialized = true;
									this.setRootNode({
										loading : true,
										text : CMDBuild.Translation.common.loading
									});
									this.abstractTree.load(function() {
										var root = this.concreteTree.getRootNode();
										var nodeRoot = me.setRootNode(root);
										this.setSubjects(function() {
											this.cacheNodes(me.getRootNode().childNodes);
											me.loaded();
										}, this);
									}, this);
								} else {
									var card = this.interactionDocument.getCurrentCard();
									if (card) {
										this.showCard(card, true);
									}
								}
							}, this);
							this.mon(this, "beforeitemexpand", function(node, eOpts) {
								var className = node.get("className");
								if (!this.blockedExpanding) {// root
									this.unloadExcess();
									me.populateNode(node, function() {
										this.cacheNodes(node.childNodes);
									}, me);
								}
								return true;
							}, this);
							this.mon(this, "checkchange", function(node, checked) {
								this.concreteTree.check(node, checked);
								this.interactionDocument.changedNavigables();
								this.interactionDocument.changed();
								this.resetChecksBlocking(this.getRootNode());
							}, this);
							this.callParent(arguments);
						},
						addDelegate : function(delegate) {
							this.delegate = delegate;
						},
						refresh : function() {
							var me = this;
							setTimeout(me._refresh(), 10);
						},
						cacheNodes : function(nodes) {
							for (var i = 0; i < nodes.length; i++) {
								var node = nodes[i];
								var className = node.get("className");
								var cardId = node.get("cardId");
								if (!this.cache[className]) {
									this.cache[className] = {};
								}
								this.cache[className][cardId] = node;
							}

						},
						refreshCard : function() {
							this.oldCard = null;
							var card = this.interactionDocument.getCurrentCard();
							this.deleteFromCache(card.className, card.cardId);
						},
						_refresh : function() {
							var card = this.interactionDocument.getCurrentCard();
							if (!card || card.cardId === -1) {
								return;
							}
							if (this.oldCard && this.oldCard.className === card.className
									&& this.oldCard.cardId == card.cardId) {
								return;
							}
							var withRefresh = (!this.oldCard);
							this.oldCard = card;
							this.showCard(card, withRefresh);
						},
						showCard : function(card, withRefresh) {
							var feature = {
								properties : {
									master_className : card.className,
									master_card : card.cardId
								}
							};
							// this.concreteTree.deleteCard(card);
							this.concreteTree.changeCard(card, function() {
								this.concreteTree.loadFeatures([ feature ], function() {
									var rootClassName = this.concreteTree.getRootClass();
									if (rootClassName === card.className) {
										var children = this.concreteTree.getBaseNodes();
										var nodeRoot = this.getRootNode();
										this.removeAllChildren(nodeRoot);										
										this.appendChildren(nodeRoot, children);
										return;
									}
									var path = this.concreteTree.getCardPath(card);
									this.blockedExpanding = true;
									this.unloadExcess();
									this.populatePath(path, function() {
										var navigable = this.getFromCache(card.className, card.cardId);
										if (navigable) {
											this.concreteTree.check(navigable, true);
											this.resetChecksBlocking(this.getRootNode());
											if (this.active) {
												selectNode(this, navigable);
											}
										}
										if (withRefresh) {
											this.interactionDocument.changedNavigables();
										}
										this.blockedExpanding = false;
									}, this);
								}, this);
							}, this);
						},
						isANavigableCard : function(card) {
							var visible = this.concreteTree.isANavigableCard(card);
							return visible;
						},
						isANavigableClass : function(className) {
							return this.abstractTree.classControlledByNavigation(className);
						},
						checkCard : function(card) {
							this.showCard(card, true);
						},
						unloadExcess : function() {
							var leafCount = this.countLeafsOnTree();
							if (leafCount > CMDBuild.gis.constants.navigation.MAX_VIEW_TREE_NODES) {
								var extent = this.interactionDocument.getMapCenter();
								var children = this.concreteTree.getBaseNodes();
								var centerScreen = [ extent[0] + (extent[2] - extent[0]) / 2,
										extent[1] + (extent[3] - extent[1]) / 2 ];
								var positionedSubjects = [];
								this.getPositionedSubjects(children, 0, positionedSubjects, function() {
									compileDistance(centerScreen, positionedSubjects);
									order(positionedSubjects);
									this.deleteFarSubjects(positionedSubjects);
								}, this);
							}
						},
						getPositionedSubjects : function(subjects, index, positionedSubjects, callback, callbackScope) {
							if (index >= subjects.length) {
								callback.apply(callbackScope, []);
								return;
							}
							var subject = subjects[index];
							index++;
							var card = {
								cardId : subject.get("cardId"),
								className : subject.get("className"),
								description : subject.get("text")
							};
							this.interactionDocument.getPosition(card, function(position) {
								positionedSubjects.push({
									position : position,
									card : card
								});
								this
										.getPositionedSubjects(subjects, index, positionedSubjects, callback,
												callbackScope);
							}, this);
						},
						setSubjects : function(callback, callbackScope) {
							this.concreteTree.expandRoot(function() {
								var children = this.concreteTree.getBaseNodes();
								var nodeRoot = this.getRootNode();
								this.appendChildren(nodeRoot, children);
								callback.apply(callbackScope, []);
							}, this);
						},
						loaded : function() {
							this.interactionDocument.setStarted(true);
						},
						appendChildren : function(node, children) {
							var children = this.orderChildren(children);
							Ext.suspendLayouts();
							this.removeAllChildren(node);
							for (var i = 0; i < children.length; i++) {
								var child = children[i];
								newNode = node.appendChild(child);
								var isLeaf = newNode.get("leaf");
								if (!isLeaf) {
									newNode.appendChild(this.concreteTree.getEmptyNode());
								}
							}
							Ext.resumeLayouts();
						},
						orderChildren : function(children) {
							function comeAfter(node1, node2) {
								var leaf1 = node1.get("leaf");
								var leaf2 = node2.get("leaf");
								if (leaf1 && ! leaf2) {
									return true;
								}
								if (leaf1 === leaf2) {
									var text1 = node1.get("text");
									var text2 = node2.get("text");
									return text1 > text2;
								}
								return false;
							}
							var changed = true;
							var index = 1;
							while (changed) {
								changed = false;
								for (var i = 0; i < children.length - index; i++) {
									if (comeAfter(children[i], children[i + 1])) {
										var child = children[i];
										children[i] = children[i + 1];
										children[i + 1] = child;
										changed = true;
									}
								}
								index += 1;
							}
							return children;
						},
						removeAllChildren : function(parent) {
							while (parent.hasChildNodes()) {
								parent.removeChild(parent.childNodes[0]);
							}
						},
						removeEmptyNode : function(parent) {
							for (var i = 0; i < parent.childNodes.length; i++) {
								var child = parent.childNodes[i];
								if (child.get("className") === CMDBuild.gis.constants.navigation.THE_EMPTY_NODE) {
									parent.removeChild(child);
									break;
								}
							}
						},
						resetChecksBlocking : function(node) {
							Ext.suspendLayouts();
							this.resetChecks(node);
							Ext.resumeLayouts();
						},
						resetChecks : function(node) {
							var className = node.get("className");
							if (className === CMDBuild.gis.constants.navigation.THE_EMPTY_NODE) {
								return;
							}
							for (var i = 0; i < node.childNodes.length; i++) {
								var child = node.childNodes[i];
								this.resetChecks(child);
							}
							var card = {
								cardId : node.get("cardId"),
								className : className
							};
							node.set("checked", this.concreteTree.isANavigableCard(card));
						},
						navigateOnCard : function(record) {
							var className = record.get("className");
							var cardId = record.get("cardId");
							this.concreteTree.check(record, true);
							this.resetChecksBlocking(this.getRootNode());
							var type = this.interactionDocument.getEntryTypeByName(className);
							if (!type) {
								return;
							}
							var classId = type.get("id");
							this.delegate.onCardNavigation({
								Id : record.get("cardId"),
								IdClass : classId
							});
						},
						populatePath : function(path, callback, callbackScope) {
							if (path.length === 0) {
								callback.apply(callbackScope, []);
								return;
							}
							var card = path.pop();
							var node = this.getFromCache(card.className, card.cardId);
							if (!node) {
								callback.apply(callbackScope, []);
								return;
							}
							this.populateNode(node, function() {
								this.populatePath(path, callback, callbackScope);
							}, this);
						},
						getFromCache : function(className, cardId) {
							if (!this.cache[className]) {
								for ( var key in this.cache) {
									if (this.interactionDocument.sameClass(key, className)) {
										if (this.cache[key][cardId]) {
											return this.cache[key][cardId];
										}
									}
								}
								return null;
							}
							return this.cache[className][cardId];
						},
						deleteFromCache : function(className, cardId) {
							if (!this.cache[className]) {
								for ( var key in this.cache) {
									if (this.interactionDocument.sameClass(key, className)) {
										if (this.cache[key][cardId]) {
											delete this.cache[key][cardId];
											return;
										}
									}
								}
								return;
							}
							delete this.cache[className][cardId];
						},
						populateNode : function(node, callback, callbackScope) {
							this.concreteTree.expand(node, function() {
								this.removeEmptyNode(node);
								var children = this.concreteTree.getChildren(node);
								this.appendChildren(node, children);
								this.cacheNodes(node.childNodes);
								callback.apply(callbackScope, []);
							}, this);
						},

						loadFeatures : function(className, attributeName, features, callback, callbackScope) {
							this.concreteTree.loadFeatures(features, function() {
								callback.apply(callbackScope, []);
							}, this);
						},
						deleteFarSubjects : function(positionedSubjects) {
							for (var i = positionedSubjects.length - 1; i > 1; i--) {
								var leafCount = this.countLeafsOnTree();
								if (leafCount < CMDBuild.gis.constants.navigation.MAX_VIEW_TREE_NODES) {
									break;
								}
								this.unloadSubject(positionedSubjects[i].card);
							}
						},
						unloadSubject : function(subjectCard) {
							var node = this.cache[subjectCard.className][subjectCard.cardId];
							while (node.hasChildNodes()) {
								this.unload(node.childNodes[0]);
							}
							node.set("expanded", false);
							node.appendChild(this.concreteTree.getEmptyNode());
						},
						unload : function(node) {
							while (node.hasChildNodes()) {
								this.unload(node.childNodes[0]);
							}
							var className = node.get("className");
							var cardId = node.get("cardId");
							this.deleteFromCache(className, cardId);
							node.parentNode.removeChild(node);
						},
						countLeafsOnTree : function() {
							var leafCount = 0;
							this.getRootNode().cascadeBy(function(node) {
								leafCount++;
							});
							return leafCount;
						},
						changeTransparency : function(transparency) {
							
						}
					});
	function selectNode(tree, node) {
		if (node.parentNode && node.parentNode.childNodes.length > CMDBuild.gis.constants.navigation.LIMIT_SELECTION) {
			node = parentNode;
		}
		var cb = Ext.Function.createDelayed(function() {
			deselectAllSilently(tree);
			var nodeEl = Ext.get(tree.view.getNode(node));
			if (nodeEl) {
				nodeEl.scrollIntoView(tree.view.el, false, false);
			}
			selectNodeSilently(tree, node);
		}, 500);
		var path = node.getPath();
		tree.selectPath(path, undefined, undefined, cb);
	}
	function deselectAllSilently(me) {
		try {
			var sm = me.getSelectionModel();
			if (sm) {
				var suppressEvent = true;
				sm.deselectAll(suppressEvent);
			}
		} catch (e) {
			_debug("ERROR deselecting the CardBrowserTree", e);
		}
	}
	function selectNodeSilently(tree, node) {
		if (!node) {
			return;
		}

		try {
			var sm = tree.getSelectionModel();
			if (sm) {
				sm.suspendEvents();
				sm.select(node);
				sm.resumeEvents();
			}
		} catch (e) {
			_debug("ERROR selecting the CardBrowserTree", e);
		}
	}
	function distance(latlng1, latlng2) {
		if (!(latlng1 && latlng2)) {
			return Number.MAX_SAFE_INTEGER;
		}
		var line = new ol.geom.LineString([ latlng1, latlng2 ]);
		return Math.round(line.getLength() * 100) / 100;
	}
	function compileDistance(centerScreen, positionedSubjects) {
		for (var i = 0; i < positionedSubjects.length; i++) {
			var position = positionedSubjects[i].position;
			positionedSubjects[i].distance = distance(position, centerScreen);
		}
	}
	function order(positionedSubjects) {
		var changed = true;
		var j = 0;
		while (changed === true) {
			changed = false;
			j++;
			for (var i = 0; i < positionedSubjects.length - j; i++) {
				var subject = positionedSubjects[i];
				var subjectSucc = positionedSubjects[i + 1];
				if (subject.distance > subjectSucc.distance) {
					positionedSubjects[i] = subjectSucc;
					positionedSubjects[i + 1] = subject;
					changed = true;
				}
			}
		}
	}
})();
