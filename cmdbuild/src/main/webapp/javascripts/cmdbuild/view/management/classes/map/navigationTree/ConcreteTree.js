(function() {
	var ROOT_NODE = "ROOT_NODE";
	Ext.define("CMDBuild.view.management.classes.map.navigationTree.ConcreteTree",
			{
				abstractTree : undefined,
				interactionDocument : undefined,
				baseNodes : [],

				/**
				 * 
				 * @property {CMDBuild.view.management.classes.map.navigationTree.Cache}
				 * 
				 */
				cache : undefined,

				constructor : function() {
					this.cache = Ext.create('CMDBuild.view.management.classes.map.navigationTree.Cache');
					this.callParent(arguments);
				},
				setInteractionDocument : function(interactionDocument) {
					this.interactionDocument = interactionDocument;
					this.interactionDocument.observeCard(this);
				},
				setAbstractTree : function(abstractTree) {
					this.abstractTree = abstractTree;
				},
				getRootNode : function() {
					var rootClass = this.abstractTree.getRootNode();
					var rootClassDescription = rootClass.targetClassDescription;
					return getNode(rootClassDescription, true, -1, "", false, true, false);
				},
				expandRoot : function(callback, callbackScope) {
					var rootClass = this.abstractTree.getRootNode();
					var rootClassName = rootClass.targetClassName;
					var params = {};
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = rootClassName;
					var me = this;
					CMDBuild.view.management.classes.map.proxy.Cards.read({
						params : params,
						loadMask : false,
						success : function(result, options, decodedResult) {
							var data = decodedResult.rows;
							me.baseNodes = getNodes(data, true, true);
							me.cache.pushNodes(me.baseNodes);
							callback.apply(callbackScope, []);
						}
					});
				},
				expand : function(viewNode, callback, callbackScope) {
					var card = {
						cardId : viewNode.get("cardId"),
						className : viewNode.get("className")
					}
					var node = this.cache.getCard(card);
					var domains = this.abstractTree.getDomainsFromTop(card.className);
					var relatedCards = [];
					this.getRelatedCards(card.cardId, card.className, domains, 0, relatedCards, function(cards) {
						for (var i = 0; i < relatedCards.length; i++) {
							var ___parentNode = relatedCards[i].___parentNode;
							if (!___parentNode) {
								relatedCards[i].___parentNode = {
									cardId : node.get("cardId"),
									className : node.get("className")
								}
							}
						}
						this.appendChildren(node, getNodes(relatedCards, true, false));
						this.pushInDeepNodes(relatedCards);
						callback.apply(callbackScope, []);
					}, this);
				},
				getBaseNodes : function() {
					return copyNodes(this.baseNodes);
				},
				getChildren : function(viewNode) {
					var className = viewNode.get("className");
					if (!className) {
						return this.getBaseNodes();
					}
					var card = {
						className : className,
						cardId : viewNode.get("cardId")
					};
					var node = this.cache.getCard(card);
					if (!node) {
						console.log("Error on trees syncronization");
					}
					return copyNodes(node.childNodes)
				},
				getRelatedCards : function(cardId, className, domains, index, relatedCards, callback, callbackScope) {
					if (index >= domains.length) {
						callback.apply(callbackScope, []);
						return;
					}
					var domain = domains[index];
					index++
					if (domain.filter) {
						var node = this.cache.getCard({
							cardId : cardId,
							className : className
						});
						var me = this;
						this.getRelatedCardsOnFilter(node, cardId, className, domain, index, relatedCards, function(
								decodedResult, tableNodes) {
							me.pushRelatedCardsInDeep(domain, me.interactionDocument, relatedCards, decodedResult.rows,
									tableNodes, function() {
										me.getRelatedCards(cardId, className, domains, index, relatedCards, callback,
												callbackScope);
									}, me);

						}, this);
						return;
					}
					var direction = (domain.direct) ? "_1" : "_2";
					var targetClassName = domain.targetClassName;
					var domainName = domain.domainName;
					var baseNode = domain.baseNode;
					var parents = [ {
						cardId : cardId,
						className : className
					} ];
					var params = this.getParamsForQuery(direction, domainName, className, targetClassName, parents);
					var me = this;
					var cards = [];
					CMDBuild.view.management.classes.map.proxy.Cards.read({
						params : params,
						loadMask : false,
						success : function(result, options, decodedResult) {
							pushRelatedCards(relatedCards, baseNode, decodedResult.rows, domain.leaf);
							me
									.getRelatedCards(cardId, className, domains, index, relatedCards, callback,
											callbackScope);
						}
					});
				},
				getEmptyNode : function() {
					return getNode("Loading...", true, Ext.id(), CMDBuild.gis.constants.navigation.THE_EMPTY_NODE,
							false, false, true, null);
				},
				loadFeature : function(feature, callback, callbackScope) {
					var card = {
						cardId : feature.properties.master_card,
						className : feature.properties.master_className
					};
					this.pushInTree(card, function() {
						callback.apply(callbackScope, []);
					}, this);
				},
				getCardPath : function(card) {
					var node = this.cache.getCard(card);
					if (node === null) {
						return [];
					}
					var path = [ node ];
					var parentNode = firstParent(node, path);
					var pathCards = [];
					for (var i = 0; i < path.length; i++) {
						pathCards.push({
							cardId : path[i].get("cardId"),
							className : path[i].get("className")
						});
					}
					return pathCards;
				},
				loadFeaturesRecursive : function(features, index, callback, callbackScope) {
					if (features.length > 501) {
						console.log("ERROR: features.length = " + features.length);
					}
					if (index >= features.length) {
						callback.apply(callbackScope, []);
						return;
					}
					var feature = features[index];
					index++;
					this.loadFeature(feature, function() {
						this.loadFeaturesRecursive(features, index, callback, callbackScope);
					}, this);
				},
				loadFeatures : function(features, callback, callbackScope) {
					this.loadFeaturesRecursive(features, 0, function() {
						callback.apply(callbackScope, []);
					}, this);
				},
				pushInTree : function(card, callback, callbackScope) {
					var node = this.cache.getCard(card);
					if (node !== null) {
						callback.apply(callbackScope, []);
						return;
					}
					this.completeTree(card, function() {
						var node = this.cache.getCard(card);
						if (node === null) {
							this.cache.pushNotInTree(card);
						}
						callback.apply(callbackScope, []);
					}, this);
				},
				completeTree : function(card, callback, callbackScope) {
					this.abstractTree.getDomains4Class(card.className, function(domains) {
						this.completeRecursive4Domains(card, domains, 0, function() {
							callback.apply(callbackScope, []);
						}, this);
					}, this);
				},
				completeRecursive4Domains : function(card, domains, index, callback, callbackScope) {
					if (index >= domains.length) {
						callback.apply(callbackScope, []);
						return;
					}
					var domain = domains[index];
					index++;
					this.searchParentOnDomain(card, domain, function() {
						this.completeRecursive4Domains(card, domains, index, callback, callbackScope);
					}, this);
				},
				getParamsForQuery : function(direction, domainId, sourceId, destinationId, parents, layers) {
					var filter = "";
					var params = {};
					if (destinationId && domainId) {
						var found = false;
						var filterOnVisibleLayers = this.getFilterOnVisibleLayers(destinationId);
						filter = getCardsFilterOnDomain(direction, domainId, sourceId, destinationId, parents, filterOnVisibleLayers);
						params[CMDBuild.core.constants.Proxy.CLASS_NAME] = destinationId;
						params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(filter);
					} else {
						// a subject
						params[CMDBuild.core.constants.Proxy.CLASS_NAME] = sourceId;

					}
					return params;
				},
				getFilterOnVisibleLayers : function(destinationId) {
					var layers = this.interactionDocument.getMap().getLayers();
					var me = this;
					var arSubClasses = [];
					layers.forEach(function(layer) {
						var geoAttribute = layer.get("geoAttribute");
						if (geoAttribute) {
							if (me.interactionDocument.isDescendant(geoAttribute.masterTableName, destinationId)) {
								arSubClasses.push({ "simple":{
				                    "attribute":"_type",
				                    "operator":"equal",
				                    "value":[geoAttribute.masterTableName]
				                }});
							}
						}
					});
					return arSubClasses;
				},
				searchParentOnDomain : function(card, domainComplete, callback, callbackScope) {
					var domain = domainComplete.domain;
					var direction = (!domain.direct) ? "_1" : "_2";
					var domainId = domain.domainName;
					var destinationId = domainComplete.parentClassName;
					var sourceId = domain.targetClassName;
					var parents = [ {
						cardId : card.cardId,
						className : card.className
					} ];
					var params = this.getParamsForQuery(direction, domainId, sourceId, destinationId, parents);
					var me = this;
					var cards = [];
					var me = this;
					CMDBuild.view.management.classes.map.proxy.Cards.read({
						params : params,
						loadMask : false,
						success : function(result, options, decodedResult) {
							if (decodedResult.rows.length === 0) {
								me.cache.pushNotInTree(card);
								callback.apply(callbackScope, []);
								return;
							}
							me.data = decodedResult.rows;
							var parentCard = {
								className : me.data[0].className,
								cardId : me.data[0].Id
							};
							me.pushAndPopulateParent(parentCard, domain, callback, callbackScope);
						}
					}, this);

				},
				pushAndPopulateParent : function(parentCard, domain, callback, callbackScope) {
					this.pushInTree(parentCard, function() {
						var node = this.cache.getCard(parentCard);
						if (node === CMDBuild.gis.constants.navigation.CARD_WITHOUT_PARENT) {
							callback.apply(callbackScope, []);
						} else {
							this.populateNodeInDeep(node, [ domain ], function() {
								callback.apply(callbackScope, []);
							}, this);
						}
					}, this);
				},
				populateNodeInDeep : function(node, domains, callback, callbackScope) {
					var cardId = node.get("cardId");
					var className = node.get("className");
					if (domains === null) {
						domains = this.abstractTree.getDomainsFromTop(className);
					}
					var relatedCards = [];
					this.getRelatedCardsInDeep(node, cardId, className, domains, 0, relatedCards, function(cards) {
						this.appendChildren(null, getNodes(relatedCards, true, false));
						this.pushInDeepNodes(relatedCards);
						callback.apply(callbackScope, []);
					}, this);
				},
				getRelatedCardsOnFilter : function(node, cardId, className, domain, index, relatedCards, callback,
						callbackScope) {
					// xaVars[FILTER_FIELD] = domain.domain.filter;
					var tableNodes = {};
					var nodeBrothers = this.getParentsForFilter(cardId, className, node, domain, tableNodes);
					if (!nodeBrothers || nodeBrothers.length === 0) {
						this.getRelatedCards(cardId, className, domains, index, relatedCards, callback, callbackScope);
						return;
					}
					var xaVars = {};
					xaVars[CMDBuild.gis.constants.navigation.FILTER_FIELD] = domain.filter;
					;
					// xaVars[FILTER_FIELD] = "{js:gisDomainFilter}";

					xaVars["father"] = node.get("cardId");
					xaVars["grandFather"] = node.raw.___parentNode.cardId;
					// xaVars["gisDomainFilter"] = domain.domain.filter;
					// es: {xa:className}=='Contatore'
					var attributes = [];
					attributes.push(CMDBuild.gis.constants.navigation.FILTER_FIELD);
					var templateResolver = new CMDBuild.Management.TemplateResolver({
						serverVars : xaVars,
						xaVars : xaVars
					});
					templateResolver.resolveTemplates({
						attributes : attributes,
						callback : function(values, ctx) {
							var callParams = templateResolver
									.buildCQLQueryParameters(values[CMDBuild.gis.constants.navigation.FILTER_FIELD]);
							var filter = Ext.encode({
								CQL : callParams.CQL
							});
							CMDBuild.view.management.classes.map.proxy.Cards.read({
								params : callParams,
								loadMask : false,
								success : function(result, options, decodedResult) {
									callback.apply(callbackScope, [ decodedResult, tableNodes ]);
								}
							});
						}
					});
				},
				getRelatedCardsInDeep : function(node, cardId, className, domains, index, relatedCards, callback,
						callbackScope) {
					if (index >= domains.length) {
						callback.apply(callbackScope, []);
						return;
					}
					var domain = domains[index];
					index++
					var me = this;
					if (domain.filter) {
						this.getRelatedCardsOnFilter(node, cardId, className, domain, index, relatedCards, function(
								decodedResult, tableNodes) {
							me.pushRelatedCardsInDeep(domain, me.interactionDocument, relatedCards, decodedResult.rows,
									tableNodes, function() {
										me.getRelatedCardsInDeep(node, cardId, className, domains, index, relatedCards,
												callback, callbackScope);
									}, me);

						}, this);
						return;
					}
					var direction = (domain.direct) ? "_1" : "_2";
					var targetClassName = domain.targetClassName;
					var tableNodes = {};
					var nodeBrothers = this.getParentsForFilter(cardId, className, node, domain, tableNodes);
					if (!nodeBrothers || nodeBrothers.length === 0) {
						this.getRelatedCardsInDeep(node, cardId, className, domains, index, relatedCards, callback,
								callbackScope);
						return;
					}
					var domainName = domain.domainName;
					var params = this
							.getParamsForQuery(direction, domainName, className, targetClassName, nodeBrothers);
					var cards = [];
					me.interactionDocument.getDomainAttributesList(targetClassName, function(tableDomains) {
						var attributes = ["Id"];
						attributes.push(tableDomains[domainName].name);
						params.attributes = Ext.encode(attributes);
    					CMDBuild.view.management.classes.map.proxy.Cards.read({
    						params : params,
    						loadMask : false,
    						success : function(result, options, decodedResult) {
    							me.pushRelatedCardsInDeep(domain, me.interactionDocument, relatedCards, decodedResult.rows,
    									tableNodes, function() {
    										me.getRelatedCardsInDeep(node, cardId, className, domains, index, relatedCards,
    												callback, callbackScope);
    									}, me);
    						}
    					});
					});
				},
				getParentsForFilter : function(cardId, className, node, domain, tableNodes) {
					var nodeBrothers = [];
					i
					if (domain.childNodes.length === 0) {
						var parentNode = this.cache.getCard(node.raw.___parentNode);
						if (!parentNode) {
							console.log("ERROR ", cardId, className, node, domain);
							return;
						}
						var parents = parentNode.childNodes;
						var parentCardId = parentNode.get("cardId");
						var parentClassName = parentNode.get("className");
						for (var i = 0; i < parents.length; i++) {
							var parent = parents[i];
							var cardId = parent.get("cardId");
							var className = parent.get("className");
							tableNodes[cardId] = parent;
							nodeBrothers.push({
								cardId : cardId,
								className : className
							});
						}
					} else {
						tableNodes[cardId] = node;
						nodeBrothers.push({
							cardId : cardId,
							className : className
						});
					}
					return nodeBrothers;
				},
				pushInDeepNodes : function(relatedCards) {
					var parentsId = {};
					for (var i = 0; i < relatedCards.length; i++) {
						if (relatedCards[i].___parentNode.className === ROOT_NODE) {
							this.cache.pushNodes(relatedCards[i]);
							continue;
						}
						var id = relatedCards[i].___parentNode.cardId;
						if (!parentsId[id]) {
							parentsId[id] = true;
							var parentNode = this.cache.getCard(relatedCards[i].___parentNode);
							this.cache.pushNodes([ parentNode ]);
							this.cache.pushNodes(parentNode.childNodes);
						}
					}
				},
				isANavigableCard : function(card) {
					var node = this.cache.getCard(card);
					if (node === CMDBuild.gis.constants.navigation.CARD_WITHOUT_PARENT) {
						return true;
					}
					var checked = node && node.get("checked");
					return checked;
				},
				checkRecursive : function(node, checked, path, level) {
					level++;// pointer on children
					var pathClassName = (path.length >= level) ? path[path.length - level].get("className") : "";
					var pathCardId = (path.length >= level) ? path[path.length - level].get("cardId") : "";
					for (var i = 0; i < node.childNodes.length; i++) {
						var child = node.childNodes[i];
						var baseNode = child.get("baseNode");
						if (checked === false || baseNode !== true) {
							this.checkRecursive(child, checked, path, level);
						} else {
							var same = (i === 0);
							if (pathClassName !== "") {
								var className = child.get("className");
								var cardId = child.get("cardId");
								var sameClass = this.interactionDocument.sameClass(className, pathClassName);
								same = (sameClass && cardId === pathCardId);
							}
							var childChecked = (same) ? true : false;
							this.checkRecursive(child, childChecked, path, level);
						}
					}
					node.set("checked", checked);
				},
				readCard : function(card, callback, callbackScope) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = card.className;
					params[CMDBuild.core.constants.Proxy.CARD_ID] = card.cardId;

					CMDBuild.view.management.classes.map.proxy.Cards.readCard({
						params : params,
						scope : this,
						loadMask : false,
						success : function(response, options, decodedResponse) {
							callback.apply(callbackScope, [ decodedResponse.card ]);
						}
					});
				},
				refreshCard : function(card) {
					var node = this.cache.getCard(card);
					if (node && node.parentNode) {
						this.removeAllChildren(node.parentNode);
					}
				},
				getRootClass : function() {
					var rootClass = this.abstractTree.getRootNode();
					var rootClassName = rootClass.targetClassName;
					return rootClassName;
				},
				changeCard : function(card, callback, callbackScope) {
					var rootClass = this.abstractTree.getRootNode();
					var rootClassName = rootClass.targetClassName;
					if (rootClassName === card.className) {
						this.expandRoot(callback, callbackScope);
					} else {
						this.pushInTree(card, function() {
							callback.apply(callbackScope, [  ]);
						}, this);
					}
				},
				check : function(viewNode, checked) {
					var card = {
						className : viewNode.get("className"),
						cardId : viewNode.get("cardId")
					};
					var node = this.cache.getCard(card);
					var path = [ node ];
					if (checked === true) {
						node = firstParent(node, path);
					}
					this.checkRecursive(node, checked, path, 1);
				},
				appendChildren : function(node, children) {
					for (var i = 0; i < children.length; i++) {
						var ___parentNode = children[i].raw.___parentNode;
						var parentNode = null;
						if (___parentNode.className !== ROOT_NODE) {
    						var parentNode = ___parentNode ? this.cache.getCard(___parentNode) : node;
    						var checked = parentNode.get("checked");
    						var baseNode = children[i].get("baseNode");
    						setCheched(children[i], checked, baseNode, i === 0);
						} else {
							children[i].set("checked", true);
						}
						children[i].parentNode = parentNode;
						if (! parentNode) {
							this.baseNodes.push(children[i]);
						}
						else if (!haveThisChild(parentNode, children[i])) {
							parentNode.childNodes.push(children[i]);
						}
					}
				},
				pushRelatedCardsInDeep : function(domain, interactionDocument, relatedCards, cards, tableNodes,
						callback, callbackScope) {
					if (cards.length === 0) {
						callback.apply(callbackScope, []);
						return;
					}
					var domainName = domain.domainName;
					var leaf = domain.leaf;
					var baseNode = domain.baseNode;
					var className = cards[0].className;
					var linkAttribute = "";
					interactionDocument.getDomainAttributesList(className, function(tableDomains) {
						if (tableDomains[domainName]) {
							linkAttribute = tableDomains[domainName].name;
						} else {
							linkAttribute = null;
						}
						for (var i = 0; i < cards.length; i++) {
							cards[i].leaf = leaf;
							cards[i].baseNode = baseNode;
							if (linkAttribute) {
								if ( ! cards[i][linkAttribute]) {
									console.log("Error on field " + linkAttribute + " not found!", cards[i]);
								}
								var parentNode = tableNodes[cards[i][linkAttribute].id];
								cards[i].___parentNode = {
										cardId : (parentNode) ? parentNode.get("cardId") : -1,
										className : (parentNode) ? parentNode.get("className") : ROOT_NODE

									};
							}
							else {
								cards[i].___parentNode = {
										cardId : -1,
										className : ROOT_NODE
									};
							}
							relatedCards.push(cards[i]);
						}
						callback.apply(callbackScope, []);
					}, this);
				},
				removeAllChildren : function(parent) {
					for (var i = 0; i < parent.childNodes.length; i++) {
						var card = {
							cardId : parent.childNodes[i].get("cardId"),
							className : parent.childNodes[i].get("className")
						};
						this.cache.deleteCard(card);

					}
					parent.childNodes = [];
				},
				dump : function(node) {
					if (node)
						dumpNode("", node);
					else
						for (var i = 0; i < this.baseNodes.length; i++) {
							dumpNode("", this.baseNodes[i]);
						}
				}
			});
	function dumpNode(indent, node) {
		var INDENT = "   ";
		console.log(indent + node.get("text"));
		for (var i = 0; i < node.childNodes.length; i++) {
			var leaf = node.get("leaf");
			if (leaf) {
				console.log(indent + INDENT + node.childNodes.length);
				break;
			}
			dumpNode(indent + INDENT, node.childNodes[i]);
		}
	}
	function getNode(description, checked, cardId, className, baseNode, expanded, leaf, ___parentNode) {
		var node = Ext.create('CMDBuild.view.management.classes.map.navigationTree.NodeModel', {
			id : cardId + "-" + className,
			text : description,
			checked : checked,
			cardId : cardId,
			className : className,
			baseNode : baseNode,
			expanded : expanded,
			leaf : leaf,
			___parentNode : ___parentNode
		});
		return node;
	}
	function copyNode(node) {
		return getNode(node.get("text"), node.get("checked"), node.get("cardId"), node.get("className"), node
				.get("baseNode"), node.get("expanded"), node.get("leaf"), node.raw.___parentNode);
	}
	function getNodes(data, withEmptyChild, areRoots) {
		var nodes = [];
		for (var i = 0; i < data.length; i++) {
			var node = data[i];
			var leaf = (node.leaf !== undefined) ? node.leaf : false
			nodes.push(getNode(node.Description, areRoots || node.checked, node.Id, node.className, node.baseNode,
					false, leaf, node.___parentNode));
		}
		return nodes;
	}
	function setCheched(node, parentChecked, baseNode, first) {
		if (parentChecked === false) {
			node.set("checked", false);
		} else {
			node.set("checked", first || !baseNode);
		}
	}
	function getCardsFilterOnDomain(direction, domainId, sourceId, destinationId, parents, filterOnVisibleLayers) {
		var cards = [];
		for (var i = 0; i < parents.length; i++) {
			cards.push({
				id : parents[i].cardId,
				className : parents[i].className
			});
		}
		var filter = {
			"relation" : [ {
				"domain" : domainId,
				"type" : "oneof",
				"destination" : sourceId,
				"source" : destinationId,
				"direction" : (direction === "_1") ? "_2" : "_1",
				"cards" : cards
			} ]
		};
		if (filterOnVisibleLayers.length > 1) {
			filter.attribute = {
					"or" : filterOnVisibleLayers
			}
		}
		else if (filterOnVisibleLayers.length === 1) {
			filter.attribute = filterOnVisibleLayers[0];
		}
		return filter;
	}
	function copyNodes(nodes) {
		var newNodes = [];
		for (var i = 0; i < nodes.length; i++) {
			newNodes.push(copyNode(nodes[i]));
		}
		return newNodes;
	}
	function pushRelatedCards(relatedCards, baseNode, cards, leaf) {
		for (var i = 0; i < cards.length; i++) {
			cards[i].leaf = leaf;
			cards[i].baseNode = baseNode;
			relatedCards.push(cards[i]);
		}
	}
	function haveThisChild(parentNode, node) {
		var nodeClassName = node.get("className");
		var nodeCardId = node.get("cardId");
		for (var i = 0; i < parentNode.childNodes.length; i++) {
			var child = parentNode.childNodes[i];
			var className = child.get("className");
			var cardId = child.get("cardId");
			if (className === nodeClassName && cardId == nodeCardId) {
				return true;
			}
		}
		return false;
	}
	function firstParent(node, path) {
		if (!node.parentNode) {
			return node;
		}
		path.push(node.parentNode);
		return firstParent(node.parentNode, path);
	}
})();
