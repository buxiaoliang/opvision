(function($) {
	if (!$.Cmdbuild.g3d) {
		$.Cmdbuild.g3d = {};
	}
	if (!$.Cmdbuild.g3d.backend) {
		$.Cmdbuild.g3d.backend = {};
	}
	var CmdbuildModel = function() {
		this.navigationTree = undefined;
		this.setModel = function(model) {
			this.model = model;
		};
		this.getInitModel = function(params, callback, callbackScope) {
			var navigationTree = $.Cmdbuild.customvariables.cacheTrees.getRootNavigationTree();
			var nodeOnNavigationTree = (navigationTree) ? navigationTree._id : null;
			if (params) {
				$.Cmdbuild.g3d.proxy.getCardData(params.classId, params.cardId, {}, function(card) {
					this.singleCard(card, params, nodeOnNavigationTree, callback, callbackScope);
				}, this);
			} else {
				callback.apply(callbackScope, []);
			}
		};
		this.singleCard = function(card, params, nodeOnNavigationTree, callback, callbackScope) {
			var elements = {
				nodes : [ {
					data : {
						label : card.Description,
						classId : params.classId,
						id : params.cardId,
						position : {
							x : 0,
							y : 0,
							z : 0
						},
						nodeOnNavigationTree : nodeOnNavigationTree
					}
				} ],
				edges : []
			};
			callback.apply(callbackScope, [ elements ]);

		};
		this.chargeModel = function(elements, domainId, nodeOnNavigationTree, sourceId, targetId, targetDescription,
				targetClassName, compoundData, parentNode, isNew) {
			sourceId = "" + sourceId;
			targetId = "" + targetId;
			var domain = $.Cmdbuild.customvariables.cacheDomains.getDomain(domainId);
			if (!domain) {
				console.log("Error :", Error().stack);
			}
			if (isNew) {
				var data = {
					classId : targetClassName,
					id : targetId,
					label : targetDescription,
					color : "#ff0000",
					faveShape : 'triangle',
					domainId : domain._id,
					position : {
						x : Math.random() * 1000 - 500,
						y : Math.random() * 600 - 300,
						z : 200
					},
					nodeOnNavigationTree : nodeOnNavigationTree,
					compoundData : compoundData,
					previousPathNode : sourceId,
					fromDomain : domainId
				};
				var node = {
					data : data
				};

				elements.nodes.push(node);
			}
			var edgeId = sourceId + domain._id + targetId;
			var edge = {
				id : edgeId,
				source : sourceId,
				target : targetId,
				domainId : domain._id,
				label : domain.domainDescription,
				color : $.Cmdbuild.custom.configuration.edgeColor,
				strength : 90
			};
			elements.edges.push({
				data : edge
			});
			var newNode = this.model.getNode(targetId);
			return newNode;
		};
		this.getAllGrahicNodes = function(id, callback, callbackScope) {
			var node = this.model.getNode(id);
			var classId = $.Cmdbuild.g3d.Model.getGraphData(node, "classId");
			this.getAllDomains(node, classId, id, callback, callbackScope);
		};
		this.loadFilteredDomains = function(index, domains, filteredDomains, callback, callbackScope) {
			if (!domains || index >= domains.length) {
				callback.apply(callbackScope, [ filteredDomains ]);
				return;
			}
			$.Cmdbuild.customvariables.cacheDomains.loadSingleDomain(domains[index].domainId, function(domain) {
				domain.nodeOnNavigationTree = domains[index]._id;
				filteredDomains.push(domain);
				this.loadFilteredDomains(++index, domains, filteredDomains, callback, callbackScope);
			}, this);
		};
		this.filteredDomains = function(node, domainList, classId, callback, callbackScope) {
			var domains = [];
			var navigationTree = $.Cmdbuild.customvariables.cacheTrees.getCurrentNavigationTree();
			if (navigationTree) {
				// this overrides other filters on domains
				domains = $.Cmdbuild.customvariables.cacheTrees.getClassPathInTree(node);
				var filteredDomains = [];
				this.loadFilteredDomains(0, domains, filteredDomains, function() {
					callback.apply(callbackScope, [ filteredDomains ]);
				}, this);
				return;
			}
			// -------------------------------------

			if (!domainList) {
				callback.apply(callbackScope, [ null ]);
				return;
			}
			domains = $.Cmdbuild.customvariables.cacheDomains.getDomains4Class(classId);
			var ret = [];
			$.Cmdbuild.customvariables.cacheDomains.getLoadingDomains4Class(classId, function(response) {
				for (var j = 0; j < response.length; j++) {
					var insert = true;
					for (var i = 0; i < domains.length; i++) {
						if (response[j]._id === domains[i]._id && domains[i].active === false) {
							insert = false;
							break;
						}
					}
					if (insert) {
						ret.push(response[j]);
					}
				}
				callback.apply(callbackScope, [ ret ]); // this
				// overrides
				// other
				// filters on domains
			}, this);
		};
		this.getAllDomains = function(node, classId, cardId, callback, callbackScope) {
			var elements = {
				nodes : [],
				edges : []
			};
			var configuration = $.Cmdbuild.custom.configuration;
			this.filteredDomains(node, configuration.filterClassesDomains, classId, function(filteredDomains) {
				this.getRelatedCards(node, classId, cardId, filteredDomains, elements, function() {
					callback.apply(callbackScope, [ elements ]);
				}, this);
			}, this);
		};
		this.getRelatedCards = function(node, classId, cardId, filteredDomains, elements, callback, callbackScope) {
			if (filteredDomains) {
				// /------------------------------------------------
				this.getAllRelatedCards(node, 0, domainsWithDirection(classId, filteredDomains), classId, parseInt(cardId),
						elements, callback, callbackScope);
			} else {
				$.Cmdbuild.customvariables.cacheDomains.getLoadingDomains4Class(classId, function(response) {
					this.getAllRelatedCards(node, 0, domainsWithDirection(classId, response), classId, parseInt(cardId),
							elements, callback, callbackScope);
				}, this);
			}
		};
		this.pushAnOpeningChild = function(elements, domainId, nodeOnNavigationTree, id, description, classId, data,
				node, parentId, children) {
			var cyNode = this.model.getNode(id);
			if (cyNode.length === 0) {
				children.push(id);
			}
			this.chargeModel(elements, domainId, nodeOnNavigationTree, parentId, id, description, classId, data, node,
					cyNode.length === 0);
		};
		this.getAllRelatedCards = function(node, index, domains, classId, cardId, elements, callback, callbackScope) {
			if (!domains || index >= domains.length) {
				callback.apply(callbackScope, [ elements ]);
				return;
			}
			var domain = domains[index];
			var domainId = domain._id;
			this.openRelatedCards(node, classId, cardId, domain, elements, function() {
				this.getAllRelatedCards(node, index + 1, domains, classId, cardId, elements, callback, callbackScope);
			}, this);
		};

		this.openRelatedCards = function(node, classId, cardId, directedDomain, elements, callback, callbackScope) {
			var filterCards = getFilterCards(directedDomain.destinationId);
			var oppositeDirection = (directedDomain.direction === "_1") ? "_2" : "_1";
			var filterOnRelation = $.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain(oppositeDirection,
					directedDomain.domain._id, directedDomain.destinationId, directedDomain.sourceId, cardId, directedDomain.sourceId);
			allFilter = getAllFilter(filterCards, filterOnRelation);
			var clusteringThreshold = $.Cmdbuild.customvariables.options.clusteringThreshold;
			var config = {
				page : 1,
				start : 0,
				limit : clusteringThreshold,
				filter : allFilter
			};
			$.Cmdbuild.g3d.proxy.getRelatedCardsOnTemporaryFilter(directedDomain.destinationId, config, function(data,
					metadata) {
				if (clusteringThreshold <= data.length) {
					this.pushCompound(elements, node, cardId, data, metadata.total, directedDomain.domain, directedDomain);
				} else {
					for (var i = 0; i < data.length; i++) {
						var nodeOnNavigationTree = directedDomain.domain.nodeOnNavigationTree;
						$.Cmdbuild.customvariables.cacheCards.push(data[i]);
						this.pushAnOpeningChild(elements, directedDomain.domain._id, nodeOnNavigationTree, data[i]._id,
								data[i].Description, data[i]._type, {}, node, cardId, []);
					}
				}
				callback.apply(callbackScope, []);
			}, this);
		};
		this.pushCompound = function(elements, node, cardId, cards, total, domain, directedDomain) {
			var description = total + " " + directedDomain.destinationId;
			var oppositeDirection = (directedDomain.direction === "_1") ? "_2" : "_1";
			var type = $.Cmdbuild.g3d.constants.GUICOMPOUNDNODE;
			$.Cmdbuild.g3d.proxy.getAllRelatedClasses({
				ClassName : directedDomain.sourceId,
				CardId : cardId,
				DomainName : "Map_" + domain._id
			}, function(data, metadata) {
				var compoundData = {
					oppositeDirection : oppositeDirection,
					sourceClassName : directedDomain.sourceId,
					destinationClassName : directedDomain.destinationId,
					total : total,
					domainId : domain._id,
					parentId : cardId,
					classes : data
				}
				this.pushAnOpeningChild(elements, domain._id, null, cards[0]._id, description, type, compoundData,
						node, cardId, []);
			}, this);

		};
		this.openCompoundNode = function(compoundData, params, callback, callbackScope) {
			var elements = {
				nodes : [],
				edges : []
			};
			var sourceClassName = compoundData.sourceClassName;
			var destinationClassName = compoundData.destinationClassName;
			var cardId = compoundData.parentId;
			var node = this.model.getNode(cardId);
			var domain = $.Cmdbuild.customvariables.cacheDomains.getDomain(compoundData.domainId);
			var directedDomain = $.Cmdbuild.g3d.backend.CmdbuildModel.getDirectedDomain(sourceClassName, domain);
			var clusteringThreshold = $.Cmdbuild.customvariables.options.clusteringThreshold;
			var filterCards = getFilterCards(destinationClassName);
			var oppositeDirection = (directedDomain.direction === "_1") ? "_2" : "_1";
			var filterOnRelation = $.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain(oppositeDirection,
					domain._id, directedDomain.destinationId, directedDomain.sourceId, cardId, directedDomain.sourceId);
			allFilter = getAllFilter(filterCards, filterOnRelation);
			var config = {
				page : params.page,
				start : params.start,
				limit : params.limit,
				filter : allFilter
			};
			$.Cmdbuild.g3d.proxy.getRelatedCardsOnTemporaryFilter(destinationClassName, config,
					function(data, metadata) {
						if (params.onlyIfOnThreshold === true && metadata.total > clusteringThreshold) {
							callback.apply(callbackScope, []);
							return;
						}
						for (var i = 0; i < data.length; i++) {
							var nodeOnNavigationTree = domain.nodeOnNavigationTree
							this.pushAnOpeningChild(elements, domain._id, nodeOnNavigationTree, data[i]._id,
									data[i].Description, data[i]._type, {}, node, cardId, []);
						}
						callback.apply(callbackScope, [ elements ]);
					}, this);
		};
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel = CmdbuildModel;

	$.Cmdbuild.g3d.backend.CmdbuildModel.prepareFilterCards = function(filter, filterClasses) {
		var totalAnds = [];
		for ( var subClass in filter) {
			var arAttributes = filter[subClass];
			if (arAttributes.length === 0) {
				continue;
			}
			var singleOrOnSubclass = "";
			if (filterClasses && filterClasses.indexOf(subClass) === -1) {
				singleOrOnSubclass = $.Cmdbuild.g3d.backend.CmdbuildModel.orOnSubclass(subClass, arAttributes);
				totalAnds.push(singleOrOnSubclass);
			}
		}
		for (var i = 0; i < filterClasses.length; i++) {
			singleOrOnSubclass = $.Cmdbuild.g3d.backend.CmdbuildModel.notOnSubclass(filterClasses[i]);
			totalAnds.push(singleOrOnSubclass);
		}
		if (totalAnds.length === 0) {
			return undefined;
		} else if (totalAnds.length > 1) {
			return {
				attribute : {
					and : totalAnds
				}
			};
		} else {
			var attribute = (totalAnds[0].not) ? {
				not : totalAnds[0].not
			} : {
				or : totalAnds[0].or
			};
			return {
				attribute : attribute
			};
		}
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.notOnSubclass = function(subClass) {
		var typeObject = {
			simple : {
				attribute : "_type",
				operator : "equal",
				value : [ subClass ]
			}
		};

		return {
			not : typeObject
		};

	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.orOnSubclass = function(subClass, arAttributes) {
		var ors = [];
		for (var i = 0; i < arAttributes.length; i++) {
			ors.push(arAttributes[i]);
		}
		ors = (ors.length > 1) ? {
			or : ors
		} : ors[0];
		var typeObject = {
			simple : {
				attribute : "_type",
				operator : "equal",
				value : [ subClass ]
			}
		};

		return {
			or : [ {
				not : typeObject,
			}, {
				and : [ typeObject, ors ],
			} ]
		};

	};
	/*
	 * @param {Object} compoundData //no thematisms on this class
	 * @compoundData.oppositeDirection @compoundData.sourceClassName
	 * @compoundData.destinationClassName @compoundData.total
	 * @compoundData.domainId @compoundData.parentId
	 * 
	 */
	$.Cmdbuild.g3d.backend.CmdbuildModel.totalCompoundedElements = function(compoundData, callback, callbackScope) {
		var filterOnRelation = $.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain(
				compoundData.oppositeDirection, compoundData.domainId, compoundData.destinationClassName,
				compoundData.sourceClassName, compoundData.parentId, compoundData.sourceClassName);
		var filterCards = getFilterCards(compoundData.destinationClassName);
		allFilter = getAllFilter(filterCards, filterOnRelation);
		var clusteringThreshold = $.Cmdbuild.customvariables.options.clusteringThreshold;
		var config = {
			page : 1,
			start : 0,
			limit : clusteringThreshold,
			filter : allFilter
		};
		$.Cmdbuild.g3d.proxy.getRelatedCardsOnTemporaryFilter(compoundData.destinationClassName, config, function(data,
				metadata) {
			callback.apply(callbackScope, [ metadata.total ]);
		}, this);
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getDirectedDomain = function(classId, domain) {
		var directSource = $.Cmdbuild.customvariables.cacheClasses.sameClass(domain.sourceId, classId);
		var validIndirectSource = $.Cmdbuild.customvariables.cacheClasses.sameClass(domain.destinationId, classId);
		return {
			domain : domain,
			direction : (directSource) ? "_1" : "_2",
			destinationId : (directSource) ? domain.destinationId : domain.sourceId,
			sourceId : (directSource) ? domain.sourceId : domain.destinationId,
			validIndirectSource : validIndirectSource === directSource
		};
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain = function(direction, domainId, sourceId,
			destinationId, cardId, classId) {
		var filter = {
			"relation" : [ {
				"domain" : domainId,
				"type" : "oneof",
				"destination" : destinationId,
				"source" : sourceId,
				"direction" : direction,
				"cards" : [ {
					"className" : classId,
					"id" : cardId
				} ]
			} ]
		};
		return filter;
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getOrs = function(filterOnAttribute) {
		var ors = [];
		var attributeId = filterOnAttribute.attribute._id;
		for (var i = 0; i < filterOnAttribute.data.length; i++) {
			var or = filterOnAttribute.data[i];
			ors.push({
				simple : {
					attribute : attributeId,
					operator : or.operator[0],
					value : [ or.data.firstParameter ],
					parameterType : "fixed"
				}

			});
		}
		var attribute = {};
		if (ors.length > 1) {
			attribute.or = ors;
		} else {
			attribute = ors[0];
		}
		return attribute;
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getJsonFilterAttributes = function(filterAttributes) {
		var attribute = null;
		var ands = [];
		for ( var key in filterAttributes) {
			var ors = $.Cmdbuild.g3d.backend.CmdbuildModel.getOrs(filterAttributes[key]);
			ands.push(ors);
		}
		if (ands.length === 1) {
			attribute = ands[0];
		} else if (ands.length > 1) {
			attribute = {
				and : []
			};
			for (var i = 0; i < ands.length; i++) {
				attribute.and.push(ands[i]);
			}
		}
		return attribute;
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getFilteredClasses = function(classId, ids, callback, callbackScope) {
		var filter = $.Cmdbuild.g3d.backend.CmdbuildModel.getFilterForAllSubClasses(classId);
		var filterCards = undefined;
		var filterClasses = $.Cmdbuild.custom.configuration.filterClasses;
		if (Object.getOwnPropertyNames(filter).length > 0 || filterClasses) {
			filterCards = $.Cmdbuild.g3d.backend.CmdbuildModel.prepareFilterCards(filter, filterClasses);
		}
		var filterOnIds = {
			simple : {
				attribute : "Id",
				operator : "in",
				value : ids
			}
		};
		var param = {
			filter : {
				attribute : {
					and : [ filterOnIds, filterCards.attribute ]
				}
			}
		};
		$.Cmdbuild.g3d.proxy.getRelatedCardsOnTemporaryFilter(classId, param, callback, callbackScope);
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getFilterForAllSubClasses = function(classId) {
		var filter = {};
		var fClasses = $.Cmdbuild.custom.configuration.filterByAttributes;
		for ( var className in fClasses) {
			if ($.Cmdbuild.customvariables.cacheClasses.sameClass(classId, className)) {
				var filtersOnClass = $.Cmdbuild.g3d.backend.CmdbuildModel.getAttributeFilterForClass(className);
				if (filtersOnClass) {
					filter[className] = filtersOnClass;
				}
			}
		}
		return filter;
	};

	$.Cmdbuild.g3d.backend.CmdbuildModel.getAttributeFilterForClass = function(classId) {
		var filters = [];
		var fAttributes = $.Cmdbuild.custom.configuration.filterByAttributes[classId];
		if (fAttributes && !$.isEmptyObject(fAttributes)) {
			for ( var attributeName in fAttributes) {
				var attribute = fAttributes[attributeName];
				var attributeFilters = $.Cmdbuild.g3d.backend.CmdbuildModel.getOperatorsOnAttribute(classId, attribute);
				if (attributeFilters) {
					filters = filters.concat(attributeFilters);
				}
			}
		}
		return (filters === []) ? null : filters;
	};
	$.Cmdbuild.g3d.backend.CmdbuildModel.getOperatorsOnAttribute = function(classId, attribute) {
		var filters = [];
		for (var i = 0; i < attribute.data.length; i++) {
			var data = attribute.data[i];
			if (!data) {
				continue;
			}
			var values = [ data.data.firstParameter ];
			if (data.data.secondParameter) {
				values.push(data.data.secondParameter)
			}
			filters.push({
				simple : {
					ClassName : classId,
					attribute : attribute.attribute._id,
					operator : data.operator[0],
					value : values
				}
			});

		}
		return filters;
	};
	function getFilterCards(type) {
		var filter = $.Cmdbuild.g3d.backend.CmdbuildModel.getFilterForAllSubClasses(type);
		var filterClasses = $.Cmdbuild.custom.configuration.filterClasses;
		var filterCards = undefined;
		if (Object.getOwnPropertyNames(filter).length > 0 || filterClasses) {
			filterCards = $.Cmdbuild.g3d.backend.CmdbuildModel.prepareFilterCards(filter, filterClasses);
		}
		return filterCards;
	}
	function getAllFilter(filterCards, filterOnRelation) {
		var allFilter = {};
		if (filterCards) {
			allFilter = {
				attribute : filterCards.attribute,
				relation : filterOnRelation.relation
			}
		} else {
			allFilter = {
				relation : filterOnRelation.relation

			}
		}
		return allFilter;
	}
	function getAllClassesFunctionId(data) {
		var name = $.Cmdbuild.g3d.constants.RELATED_CLASSES_FUNCTION;
		for (var i = 0; i < data.length; i++) {
			if (name === data[i].name) {
				return data[i]._id;
			}
		}
		console.log("Error: the function " + name + " not found!");
	}
	function domainsWithDirection(classId, domains) {
		var directedDomains = [];
		for (var i = 0; i < domains.length; i++) {
			var directedDomain = $.Cmdbuild.g3d.backend.CmdbuildModel.getDirectedDomain(classId, domains[i]);
			directedDomains.push(directedDomain);
			if (directedDomain.validIndirectSource) {
				directedDomains.push({
					domain : directedDomain.domain,
					direction : (directedDomain.direction === "_2") ? "_1" : "_2",
					destinationId : directedDomain.sourceId,
					sourceId : directedDomain.destinationId
				});
			}
		}
		return directedDomains;
	}
})(jQuery);
