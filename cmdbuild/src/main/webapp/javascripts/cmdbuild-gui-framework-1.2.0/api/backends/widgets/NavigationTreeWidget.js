(function($) {

	/**
	 * Navigation Tree widget implementation
	 * 
	 * @param {Object} params
	 * @param {Function} onReadyFunction Called when the backend is initialized.
	 * @param {DOM} onReadyScope Callback scope
	 */
	var NavigationTreeWidget = function(params, onReadyFunction, onReadyScope) {
		this.instanceForm = null;
		this.widgetId = null;
		this.widgetConfig = null;
		this.description = null;
		this.nodes = [];

		/*
		 * BASE FUNCTIONS
		 */
		/**
		 * Initialize Backend
		 */
		this.init = function() {
			this.instanceForm = params.instanceForm;
			this.widgetId = params.widgetId;
			this.formname = $.Cmdbuild.widgets.NavigationTree.formName(this.instanceForm, {_id : this.widgetId});
			this.widgetConfig = getWidgetConfig(this.instanceForm, this.widgetId);

			// compile cql
			$.Cmdbuild.CqlManager.compile(this.instanceForm, $.Cmdbuild.dataModel.forms[this.instanceForm].getBackendAttributes());

			// load tree
			this.loadTree();
		};

		/**
		 * Load Tree Structure
		 */
		this.loadTree = function() {
			var me = this;

			// get navigation tree data
			$.Cmdbuild.utilities.proxy.getNavigationTree(
					this.widgetConfig.navigationTreeName, function(data,
							metadata) {

						// save description and nodes in backend
						me.description = data.description;
						getDomainsInfo(data.nodes, this);
					}, me);
		};


		/*
		 * GETTERS
		 */
		/**
		 * Get tree description
		 * 
		 * @return {String}
		 */
		this.getTreeDescription = function() {
			return this.description;
		};
		/**
		 * Get tree nodes
		 * 
		 * @return {Array}
		 */
		this.getTreeNodes = function() {
			return this.nodes;
		};
		/**
		 * Get root node
		 * 
		 * @return {Object}
		 */
		this.getRootNode = function() {
			var me = this;
			var nodes = $.grep(me.nodes, function(node) {
				return node.parent === null;
			});
			if (nodes.length) {
				return nodes[0];
			}
		};
		/**
		 * Get children nodes
		 * 
		 * @param {Numeric} parent Node id
		 * @return {Object}
		 */
		this.getChildrenNodes = function(parent) {
			var me = this;
			var nodes = $.grep(me.nodes, function(node) {
				return node.parent == parent;
			});
			return nodes;
		};

		/**
		 * Return items for node
		 * 
		 * @param {Object} node
		 * @param {Function} callback
		 * @param {DOM} scope
		 */
		this.getNodeItems = function(node, parentItemId, callback, scope) {
			var me = this;

			if (node.target.filter && node.target.filter.text) {
				cqlEvaluate({
					form : me.instanceForm,
					filter : node.target.filter.text
				}, function(value) {
					if (value) {
						value = value.trim();
						if (value === $.Cmdbuild.global.CQLUNDEFINEDVALUE) {
							value = null;
						}
					}

					// create CQL request
					var params = {};
					params.filter = {CQL : value};

					if (node.target.type === "class") {
						// classes
						$.Cmdbuild.utilities.proxy.getCardList(node.target.name, params, extractIds, me);
					} else if (node.target.type === "process") {
						// processes
						$.Cmdbuild.utilities.proxy.getActivityList(node.target.name, params, extractIds, me);
					}
				}, me);
			} else {
				loadFilteredItems();
			}

			/**
			 * Load Cards/Instances filtered by relations
			 * 
			 * @param {Array} ids Optional
			 */
			function loadFilteredItems(ids) {
				var configuration = {};
				var filter = {
					name : "tempfilter",
					description : "tempfilter"
				};

				// add relation filter
				if (parentItemId && node.domain) {
					configuration.relation = createRelationFilter(node, parentItemId);
				}

				// add attribute filter
				if (ids && ids.length) {
					configuration.attribute = createAttributeFilter(ids);
				}

				filter.configuration = JSON.stringify(configuration);

				$.Cmdbuild.utilities.proxy.postTemporaryFilter(node.target.name, node.target.type, function(data) {
					var reqparams = {
						filter : {
							"_temporaryId" : data._id
						}
					};
					if (node.target.type === "class") {
						// classes
						$.Cmdbuild.utilities.proxy.getCardList(node.target.name, reqparams, callback, scope);
					} else if (node.target.type === "process") {
						// processes
						$.Cmdbuild.utilities.proxy.getActivityList(node.target.name, reqparams, callback, scope);
					}
				}, me, filter);

			};

			/**
			 * Extract ids from results
			 * 
			 * @param {Array} results
			 */
			function extractIds(results) {
				var ids = [];
				$.each(results, function(index, item) {
					ids.push(item._id);
				});
				loadFilteredItems(ids);
			};

		};

		/**
		 * Add/remove selection
		 * 
		 * @param {Numeric} id
		 * @param {String} type
		 */
		this.addRemoveSelection = function(id, type) {
			var items = this.getSelectedItems();

			// check if item is in selected items
			var matching = $.grep(items, function(item) {
				return item.cardId == id;
			});

			if (matching.length) {
				// remove if present
				var newitems = [];
				$.each(items, function(index, item) {
					if (! item.cardId == id) {
						newitems.push(item);
					}
				});
				items = newitems;
			} else {
				// add if not present
				items.push({
					cardId : id,
					className : type
				});
			}
			this.setSelectedItems(items);
		};

		/**
		 * Check if item is selected
		 * 
		 * @param {Numeric} id
		 * @return {Boolean}
		 */
		this.isSelected = function(id) {
			var items = this.getSelectedItems();
			var matching = $.grep(items, function(item) {
				return item.cardId == id;
			});
			return matching.length > 0;
		};

		/**
		 * Get selected items
		 * 
		 * @return {Array}
		 */
		this.getSelectedItems = function() {
			return $.Cmdbuild.dataModel.getData(this.formname);
		}

		/*
		 * SETTERS
		 */
		/**
		 * Set selected items
		 * 
		 * @param {Array} items
		 */
		this.setSelectedItems = function(items) {
			$.Cmdbuild.dataModel.updateData(this.formname, items);
		}

		/*
		 * PRIVATE FUNCTIONS
		 */
		/**
		 * Call on ready Function
		 */
		function onObjectReady () {
			onReadyFunction.apply(onReadyScope);
		};

		/**
		 * Get domains informations
		 * 
		 * @param {Array} nodes
		 */
		function getDomainsInfo(nodes, scope) {
			// if there are not node, execute onReady function
			if (!nodes.length) {
				// object ready
				onObjectReady();
				return;
			}

			function addItemToNodes(node, domain) {
				// base node
				var item = {
					_id : node._id,
					parent : node.parent,
					recursionEnabled : node.metadata.recursionEnabled,
					target : {
						name : node.metadata.targetClass,
						type : getTargetType(node.metadata.targetClass),
						filter : node.metadata.filter
					}
				};
				// domain info
				if (domain) {
					item.domain = {
						_id : domain._id,
						source : domain.source,
						destination : domain.destination,
						descriptionDirect : domain.descriptionDirect,
						descriptionInverse : domain.descriptionInverse
					};
				}
				// add item to nodes list
				scope.nodes.push(item);
				getDomainsInfo(nodes, scope);
			}

			// get node
			var node = nodes.splice(0, 1)[0];

			// get domain info
			if (node.metadata.domain) {
				$.Cmdbuild.utilities.proxy.getDomain(node.metadata.domain, function(domain, metadata) {
					addItemToNodes(node, domain);
				}, scope);
			} else {
				addItemToNodes(node, null);
			}
		};

		/**
		 * Find node by id
		 * 
		 * @param {Numeric} nodeId
		 * @param {Array} nodes
		 * @return {Object} node
		 */
		function getNodeById(nodeId, nodes) {
			var nodes = $.grep(nodes, function(node) {
				return node._id === nodeId;
			});
			if (nodes.length) {
				return nodes[0];
			}
		};

		/*
		 * CUSTOM FUNCTIONS
		 */
		

		/*
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.standard.backend.NavigationTreeWidget = NavigationTreeWidget;

	/**
	 * @param {String} instanceForm 
	 * @return {Object}
	 */
	function getWidgetConfig(instanceForm, widgetId) {
		var instanceForm = $.Cmdbuild.dataModel.forms[instanceForm];
		var formWidgets = instanceForm.getBackendWidgets();
		var i = 0;
		while (i < formWidgets.length) {
			if (formWidgets[i]._id === widgetId) {
				return formWidgets[i].data;
			}
			i++;
		}
		return null;
	};

	/**
	 * Get target type
	 * 
	 * @param {String} targetName
	 * @return {String}
	 */
	function getTargetType(targetName) {
		if ($.Cmdbuild.dataModel.isAClass(targetName)) {
			return "class";
		} else if ($.Cmdbuild.dataModel.isAProcess(targetName)) {
			return "process";
		}
	};

	/**
	 * Create relation filter
	 * 
	 * @param {Object} node
	 * @param {Numeric} parentId
	 * @return {Object}
	 */
	function createRelationFilter(node, parendId) {
		var direction, destination;
		if (node.target.name === node.domain.source) {
			direction = "_1";
			destination = node.domain.destination;
		} else {
			direction = "_2";
			destination = node.domain.source;
		}
		return [{
			domain : node.domain._id,
			type : "oneof",
			destination : destination,
			source : node.target.name,
			direction : direction,
			cards : [{
				className : destination,
				id : parendId
			}]
		}]
	};

	/**
	 * Create attribute filter
	 * 
	 * @param {Array} ids
	 * @return {Object}
	 */
	function createAttributeFilter(ids) {
		return {
			simple : {
				attribute : "Id",
				operator : "in",
				value : ids
			}
		};
	};

})(jQuery);