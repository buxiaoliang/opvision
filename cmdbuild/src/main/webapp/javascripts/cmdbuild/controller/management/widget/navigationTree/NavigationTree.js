(function () {

	Ext.define('CMDBuild.controller.management.widget.navigationTree.NavigationTree', {
		extend: 'CMDBuild.controller.common.abstract.Widget',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.interfaces.service.LoadMask',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.widget.NavigationTree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		bufferClasses: {
			byId: {},
			byName: {}
		},

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		bufferDomains: [],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		bufferNodes: [],

		/**
		 * @property {CMDBuild.model.CMActivityInstance}
		 */
		card: undefined,

		/**
		 * @property {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'getTemplateResolverServerVars = widgetNavigationTreeGetTemplateResolverServerVars',
			'isValid',
			'onBeforeSave',
			'onEditMode',
			'onWidgetNavigationTreeCheckChange',
			'onWidgetNavigationTreeBeforeActiveView = beforeActiveView',
			'onWidgetNavigationTreeBeforeHideView = beforeHideView',
			'onWidgetNavigationTreeNodeExpand',
			'widgetConfigurationGet = widgetNavigationTreeConfigurationGet',
			'widgetConfigurationIsEmpty = widgetNavigationTreeConfigurationIsEmpty',
			'widgetNavigationTreeDataGet = getData'
		],

		/**
		 * @property {CMDBuild.controller.management.widget.navigationTree.SelectionModel}
		 */
		selectionModel: undefined,

		/**
		 * @property {CMDBuild.view.management.widget.navigationTree.TreePanel}
		 */
		treePanel: undefined,

		/**
		 * @property {CMDBuild.view.management.widget.navigationTree.NavigationTreeView}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.navigationTree.Configuration',

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.common.CMWidgetManagerController} configurationObject.parentDelegate
		 * @param {CMDBuild.model.CMActivityInstance} configurationObject.card
		 * @param {Ext.form.Basic} configurationObject.clientForm
		 * @param {CMDBuild.view.management.widget.navigationTree.NavigationTreeView} configurationObject.view
		 * @param {Object} configurationObject.widgetConfiguration
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.selectionModel = Ext.create('CMDBuild.controller.management.widget.navigationTree.SelectionModel');

			this.view.removeAll();
			this.view.add(
				this.treePanel = Ext.create('CMDBuild.view.management.widget.navigationTree.TreePanel', { delegate: this })
			);
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCache: function (callback) {
			this.buildLocalCacheClasses(function () {
				this.buildLocalCacheDomains(function () {
					this.buildLocalCacheNavigationTree(callback);
				});
			});
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCacheClasses: function (callback) {
			// Error handling
				if (!Ext.isFunction(callback))
					return _error('buildLocalCacheClasses(): unmanaged callback parameter', this, callback);
			// END: Error handling

			this.widgetNavigationTreeBufferClassesReset();

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.management.widget.NavigationTree.readAllClasses({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.widgetNavigationTreeBufferClassesSet(decodedResponse);

						Ext.callback(callback, this);
					} else {
						_error('buildLocalCacheClasses(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCacheDomains: function (callback) {
			// Error handling
				if (!Ext.isFunction(callback))
					return _error('buildLocalCacheDomains(): unmanaged callback parameter', this, callback);
			// END: Error handling

			this.widgetNavigationTreeBufferDomainsReset();

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.management.widget.NavigationTree.readAllDomains({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.widgetNavigationTreeBufferDomainsSet(decodedResponse);

						Ext.callback(callback, this);
					} else {
						_error('buildLocalCacheDomains(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildLocalCacheNavigationTree: function (callback) {
			// Error handling
				if (!Ext.isFunction(callback))
					return _error('buildLocalCacheNavigationTree(): unmanaged callback parameter', this, callback);
			// END: Error handling

			this.widgetNavigationTreeBufferNodesReset();

			var params = {};
			params[CMDBuild.core.constants.Proxy.NAME] = this.cmfg('widgetNavigationTreeConfigurationGet', CMDBuild.core.constants.Proxy.TREE_NAME);

			CMDBuild.proxy.management.widget.NavigationTree.read({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = Ext.decode(decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE]);

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.widgetNavigationTreeBufferNodesSet(decodedResponse);

						Ext.callback(callback, this, [this.widgetNavigationTreeBufferNodesGet(decodedResponse[CMDBuild.core.constants.Proxy.ID])]);
					} else {
						_error('buildLocalCacheNavigationTree(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * Builds store tree child nodes based on navigationTree node definition
		 *
		 * @param {CMDBuild.model.management.widget.navigationTree.Node} node
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildNode: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node))
					return _error('buildNode(): unmanaged node parameter', this, node);
			// END: Error handling

			var navigationTreeNode = this.widgetNavigationTreeBufferNodesGet(node.get(CMDBuild.core.constants.Proxy.NAVIGATION_TREE_NODE_ID)),
				navigationTreeNodeChildIds = navigationTreeNode.get(CMDBuild.core.constants.Proxy.CHILD_NODES_ID);

			node.removeAll();

			if (Ext.isArray(navigationTreeNodeChildIds) && !Ext.isEmpty(navigationTreeNodeChildIds))
				Ext.Array.each(navigationTreeNodeChildIds, function (childId, i, allChildIds) {
					var filterObject = {},
						navigationTreeChildNode = this.widgetNavigationTreeBufferNodesGet(childId),
						navigationTreeChildNodeDomainName = navigationTreeChildNode.get(CMDBuild.core.constants.Proxy.DOMAIN_NAME),
						navigationTreeChildNodeTargetClassName = navigationTreeChildNode.get(CMDBuild.core.constants.Proxy.TARGET_CLASS_NAME);

					this.getCardsFromFilter({
						className: navigationTreeChildNodeTargetClassName,
						filter: navigationTreeChildNode.get(CMDBuild.core.constants.Proxy.FILTER),
						scope: this,
						callback: function (cardsIds) {
							if (Ext.isString(navigationTreeChildNodeDomainName) && !Ext.isEmpty(navigationTreeChildNodeDomainName)) {
								var domainModel = this.widgetNavigationTreeBufferDomainsGet(navigationTreeChildNodeDomainName),
									domainModelDestinationClassName = domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME);

								filterObject[CMDBuild.core.constants.Proxy.RELATION] = [{
									domain: domainModel.get(CMDBuild.core.constants.Proxy.NAME),
									type: 'oneof',
									destination: navigationTreeChildNodeTargetClassName == domainModelDestinationClassName
										? domainModel.get(CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME) : domainModelDestinationClassName,
									source: navigationTreeChildNodeTargetClassName,
									direction:  navigationTreeChildNodeTargetClassName == domainModelDestinationClassName ? '_2' : '_1',
									cards: [{
										className: node.get(CMDBuild.core.constants.Proxy.CLASS_NAME),
										id: node.get(CMDBuild.core.constants.Proxy.CARD_ID)
									}]
								}];
							}

							if (Ext.isArray(cardsIds) && !Ext.isEmpty(cardsIds))
								filterObject[CMDBuild.core.constants.Proxy.ATTRIBUTE] = {
									simple: {
										attribute: 'Id',
										operator: 'in',
										value: cardsIds,
										parameterType: 'fixed'
									}
								};

							var params = {};
							params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Code', 'Description']);
							params[CMDBuild.core.constants.Proxy.CLASS_NAME] = navigationTreeNode.get(CMDBuild.core.constants.Proxy.TARGET_CLASS_NAME);

							if (Ext.isObject(filterObject) && !Ext.Object.isEmpty(filterObject)) {
								params[CMDBuild.core.constants.Proxy.CLASS_NAME] = navigationTreeChildNodeTargetClassName;
								params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(filterObject);
							}

							CMDBuild.proxy.management.widget.NavigationTree.readAllCards({
								params: params,
								loadMask: this.view,
								scope: this,
								success: function (response, options, decodedResponse) {
									decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

									if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
										Ext.Array.each(decodedResponse, function (cardObject, i, allCardObjects) {
											this.buildNodeFromCard(node, cardObject, childId);
										}, this);

										this.treePanel.getStore().sort(CMDBuild.core.constants.Proxy.DESCRIPTION, 'ASC');
									}
								}
							});
						}
					});
				}, this);
		},

		/**
		 * @param {CMDBuild.model.management.widget.navigationTree.Node} parentNode
		 * @param {Object} cardObject
		 * @param {Number} navigationTreeNodeId
		 *
		 * @returns {CMDBuild.model.management.widget.navigationTree.Node} cardNode
		 *
		 * @private
		 */
		buildNodeFromCard: function (parentNode, cardObject, navigationTreeNodeId) {
			// Error handling
				if (!Ext.isObject(parentNode) || Ext.Object.isEmpty(parentNode))
					return _error('buildNodeFromCard(): unmanaged parentNode parameter', this, parentNode);

				if (!Ext.isObject(cardObject) || Ext.Object.isEmpty(cardObject))
					return _error('buildNodeFromCard(): unmanaged cardObject parameter', this, cardObject);
			// END: Error handling

			var nodeDescriptionComponents = [],
				navigationTreeNode = this.widgetNavigationTreeBufferNodesGet(navigationTreeNodeId),
				domainModel = this.widgetNavigationTreeBufferDomainsGet(navigationTreeNode.get(CMDBuild.core.constants.Proxy.DOMAIN_NAME));

			// Build node description
				if (
					Ext.isObject(navigationTreeNode) && !Ext.Object.isEmpty(navigationTreeNode)
					&& Ext.isObject(domainModel) && !Ext.Object.isEmpty(domainModel)
				) {
					var classAnchestorsNames = this.widgetNavigationTreeBufferClassesAnchestorsNamesGet(cardObject[CMDBuild.core.constants.Proxy.CLASS_NAME]),
						destinationClassModel = this.widgetNavigationTreeBufferClassesGet({ name: domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME) });

					// Domain's oriented description
					if (Ext.Array.contains(classAnchestorsNames, domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME))) {
						nodeDescriptionComponents.push(domainModel.get(CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION));
					} else {
						nodeDescriptionComponents.push(domainModel.get(CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION));
					}

					// Domain's destination class name
					nodeDescriptionComponents.push(destinationClassModel.get(CMDBuild.core.constants.Proxy.DESCRIPTION));
				}

				// Card's code
				if (!Ext.isEmpty(cardObject['Code']))
					nodeDescriptionComponents.push('[' + cardObject['Code'] + ']');

				// Card's description
				if (!Ext.isEmpty(cardObject['Description']))
					nodeDescriptionComponents.push(cardObject['Description']);

			var nodeStructureObject = {};
			nodeStructureObject['iconCls'] = 'cmdb-tree-class-icon'; // FIXME: use own icon
			nodeStructureObject[CMDBuild.core.constants.Proxy.CARD_ID] = cardObject['Id'];
			nodeStructureObject[CMDBuild.core.constants.Proxy.CHECKED] = this.selectionModel.isSelected(cardObject['Id']);
			nodeStructureObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = cardObject[CMDBuild.core.constants.Proxy.CLASS_NAME];
			nodeStructureObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = Ext.isEmpty(nodeDescriptionComponents) ? '' : nodeDescriptionComponents.join(' ');
			nodeStructureObject[CMDBuild.core.constants.Proxy.LEAF] = true;
			nodeStructureObject[CMDBuild.core.constants.Proxy.NAVIGATION_TREE_NODE_ID] = navigationTreeNodeId;
			nodeStructureObject[CMDBuild.core.constants.Proxy.PARENT] = parentNode;

			// Reconfigure parentNode
			parentNode.set('iconCls', null);
			parentNode.set(CMDBuild.core.constants.Proxy.LEAF, false);

			return parentNode.appendChild(nodeStructureObject);
		},

		/**
		 * Builds store tree root node based on navigationTree node definition
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildNodeRoot: function () {
			var node = this.treePanel.getStore().getRootNode(),
				navigationTreeNode = this.widgetNavigationTreeBufferNodesGet(node.get(CMDBuild.core.constants.Proxy.NAVIGATION_TREE_NODE_ID));

			this.getCardsFromFilter({
				className: navigationTreeNode.get(CMDBuild.core.constants.Proxy.TARGET_CLASS_NAME),
				filter: navigationTreeNode.get(CMDBuild.core.constants.Proxy.FILTER),
				scope: this,
				callback: function (cardsIds) {
					var params = {};
					params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Code', 'Description']);
					params[CMDBuild.core.constants.Proxy.CLASS_NAME] = navigationTreeNode.get(CMDBuild.core.constants.Proxy.TARGET_CLASS_NAME);

					if (Ext.isArray(cardsIds) && !Ext.isEmpty(cardsIds))
						params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode({
							attribute: {
								simple: {
									attribute: 'Id',
									operator: 'in',
									value: cardsIds,
									parameterType: 'fixed'
								}
							}
						});

					CMDBuild.proxy.management.widget.NavigationTree.readAllCards({
						params: params,
						loadMask: false,
						scope: this,
						callback: function (options, success, response) {
							CMDBuild.core.interfaces.service.LoadMask.manage(this.view, false); // Manually manage LoadMask (hide)
						},
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

							if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
								Ext.Array.each(decodedResponse, function (cardObject, i, allCardObjects) {
									var childNode = this.buildNodeFromCard(node, cardObject, navigationTreeNode.get(CMDBuild.core.constants.Proxy.ID));

									if (Ext.isObject(childNode) && !Ext.Object.isEmpty(childNode))
										this.buildNode(childNode);
								}, this);

								this.treePanel.getStore().sort(CMDBuild.core.constants.Proxy.DESCRIPTION, 'ASC');
							}
						}
					});
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {String} parameters.className
		 * @param {String} parameters.filter
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		getCardsFromFilter: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (!Ext.isFunction(parameters.callback))
					return _error('getCardsFromFilter(): unmanaged callback parameter', this, parameters.callback);
			// END: Error handling

			if (
				Ext.isString(parameters.className) && !Ext.isEmpty(parameters.className)
				&& Ext.isString(parameters.filter) && !Ext.isEmpty(parameters.filter)
			) {
				var resolvedFilter = this.resolveNodeFilter(parameters.filter);

				var params = {};
				params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(['Description']);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = parameters.className;

				if (Ext.isString(resolvedFilter) && !Ext.isEmpty(resolvedFilter))
					params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode({ CQL: resolvedFilter });

				CMDBuild.proxy.management.widget.NavigationTree.readAllCards({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ROWS];

						var filteredCardsIds = [];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
							Ext.Array.each(decodedResponse, function (cardObject, i, allCardObjects) {
								if (Ext.isObject(cardObject) && !Ext.Object.isEmpty(cardObject))
									filteredCardsIds.push(cardObject['Id']);
							}, this);

						if (!Ext.isEmpty(filteredCardsIds))
							Ext.callback(parameters.callback, parameters.scope, [filteredCardsIds]);
					}
				});
			} else {
				Ext.callback(parameters.callback, parameters.scope);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.checked
		 * @param {CMDBuild.model.management.widget.navigationTree.Node} parameters.node
		 *
		 * @returns {Void}
		 */
		onWidgetNavigationTreeCheckChange: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isBoolean(parameters.checked) || Ext.isEmpty(parameters.checked))
					return _error('onWidgetNavigationTreeCheckChange(): unmanaged checked parameter', this, parameters.checked);

				if (!Ext.isObject(parameters.node) || Ext.Object.isEmpty(parameters.node))
					return _error('onWidgetNavigationTreeCheckChange(): unmanaged node parameter', this, parameters.node);
			// END: Error handling

			if (!parameters.checked)
				return this.selectionModel.deselect(parameters.node);

			return this.selectionModel.select(parameters.node);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onWidgetNavigationTreeBeforeActiveView: function () {
			this.beforeActiveView(arguments); // CallParent alias

			// Error handling
				if (this.cmfg('widgetNavigationTreeConfigurationIsEmpty'))
					return _error('onWidgetNavigationTreeBeforeActiveView(): unmanaged configuration property', this, this.cmfg('widgetNavigationTreeConfigurationGet'));
			// END: Error handling

			var root = this.treePanel.getStore().getRootNode();

			// Create buffer with data configuration parameter if not exists
			if (!this.instancesDataStorageExists())
				this.instancesDataStorageSet([]); // FIXME: future implementation (preset configuration property)

			this.selectionModel.deselectAll();

			// From data storage
			if (!this.instancesDataStorageIsEmpty())
				Ext.Array.each(this.instancesDataStorageGet(), function (selectionObject, i, allSelectionObjects) {
					if (Ext.isObject(selectionObject) && !Ext.Object.isEmpty(selectionObject))
						this.selectionModel.select(selectionObject);
				}, this);

			root.removeAll();

			CMDBuild.core.interfaces.service.LoadMask.manage(this.view, true); // Manually manage LoadMask (show)

			this.buildLocalCache(function (navigationTreeRootNode) {
				root.set(CMDBuild.core.constants.Proxy.NAVIGATION_TREE_NODE_ID, navigationTreeRootNode.get(CMDBuild.core.constants.Proxy.ID));

				this.buildNodeRoot();
			});
		},

		/**
		 * Save data in storage attribute
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onWidgetNavigationTreeBeforeHideView: function () {
			this.instancesDataStorageSet(this.selectionModel.getSelection());

			this.beforeHideView(arguments); // CallParent alias
		},

		/**
		 * @param {CMDBuild.model.management.widget.navigationTree.Node} node
		 *
		 * @returns {Void}
		 */
		onWidgetNavigationTreeNodeExpand: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node))
					return _error('onWidgetNavigationTreeNodeExpand(): unmanaged node parameter', this, node);
			// END: Error handling

			node.eachChild(function (childNode) {
				this.buildNode(childNode);
			}, this);
		},

		/**
		 * @returns {String} filter
		 *
		 * @private
		 */
		resolveNodeFilter: function (nodeFilter) {
			var resolvedFilter = '';

			if (Ext.isString(nodeFilter) && !Ext.isEmpty(nodeFilter)) {
				var templateResolver = new CMDBuild.Management.TemplateResolver({
					clientForm: this.clientForm,
					xaVars: { '_SystemFieldFilter': nodeFilter },
					serverVars: this.cmfg('widgetNavigationTreeGetTemplateResolverServerVars')
				});

				templateResolver.resolveTemplates({
					attributes: ['_SystemFieldFilter'],
					scope: this,
					callback: function (out, ctx) {
						var outputFilter = templateResolver.buildCQLQueryParameters(out['_SystemFieldFilter']);

						if (Ext.isObject(outputFilter) && !Ext.Object.isEmpty(outputFilter))
							resolvedFilter = outputFilter['CQL'];
					}
				});
			}

			return resolvedFilter;
		},

		// BufferClasses property functions
			/**
			 * @param {String} name
			 *
			 * @returns {Array} anchestorsNames
			 *
			 * @private
			 */
			widgetNavigationTreeBufferClassesAnchestorsNamesGet: function (name) {
				var anchestorsNames = [],
					classModel = this.widgetNavigationTreeBufferClassesGet({ name: name });

				if (!Ext.isEmpty(classModel)) {
					anchestorsNames.push(classModel.get(CMDBuild.core.constants.Proxy.NAME));

					while (!Ext.isEmpty(classModel.get(CMDBuild.core.constants.Proxy.PARENT))) {
						classModel = this.widgetNavigationTreeBufferClassesGet({ id: classModel.get(CMDBuild.core.constants.Proxy.PARENT) });

						if (!Ext.isEmpty(classModel))
							anchestorsNames.push(classModel.get(CMDBuild.core.constants.Proxy.NAME));
					}
				}

				return anchestorsNames;
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferClassesReset: function () {
				this.bufferClasses = {
					byId: {},
					byName: {}
				};
			},

			/**
			 * @param {Object} parameters
			 * @param {Number} parameters.id
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.management.widget.navigationTree.Class or null}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferClassesGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id))
					return this.bufferClasses.byId[parameters.id];

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name))
					return this.bufferClasses.byName[parameters.name];

				return null;
			},

			/**
			 * @param {Array} classes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferClassesSet: function (classes) {
				if (Ext.isArray(classes) && !Ext.isEmpty(classes))
					Ext.Array.each(classes, function (classObject, i, allClassObjects) {
						if (Ext.isObject(classObject) && !Ext.Object.isEmpty(classObject)) {
							var model = Ext.create('CMDBuild.model.management.widget.navigationTree.Class', classObject);

							this.bufferClasses.byId[model.get(CMDBuild.core.constants.Proxy.ID)] = model;
							this.bufferClasses.byName[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		// BufferDomains property functions
			/**
			 * @param {String} name
			 *
			 * @returns {CMDBuild.model.management.widget.navigationTree.Domain or null}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferDomainsGet: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return this.bufferDomains[name];

				return null;
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferDomainsReset: function () {
				this.bufferDomains = [];
			},

			/**
			 * @param {Array} domains
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferDomainsSet: function (domains) {
				if (Ext.isArray(domains) && !Ext.isEmpty(domains))
					Ext.Array.each(domains, function (domainObject, i, allDomainObjects) {
						if (Ext.isObject(domainObject) && !Ext.Object.isEmpty(domainObject)) {
							var model = Ext.create('CMDBuild.model.management.widget.navigationTree.Domain', domainObject);

							this.bufferDomains[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		// BufferNodes property functions
			/**
			 * @param {Number} id
			 *
			 * @returns {CMDBuild.model.management.widget.navigationTree.NavigationTreeNodeStructure or null}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferNodesGet: function (id) {
				if (Ext.isNumber(id) && !Ext.isEmpty(id))
					return this.bufferNodes[id];

				return null;
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferNodesReset: function () {
				this.bufferNodes = [];
			},

			/**
			 * @param {Object} navigationTreeNode
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			widgetNavigationTreeBufferNodesSet: function (navigationTreeNode) {
				if (Ext.isObject(navigationTreeNode) && !Ext.Object.isEmpty(navigationTreeNode)) {
					this.bufferNodes[navigationTreeNode[CMDBuild.core.constants.Proxy.ID]] = Ext.create(
						'CMDBuild.model.management.widget.navigationTree.NavigationTreeNodeStructure',
						navigationTreeNode
					);

					var childNodes = navigationTreeNode[CMDBuild.core.constants.Proxy.CHILD_NODES];

					if (Ext.isArray(childNodes) && !Ext.isEmpty(childNodes))
						Ext.Array.each(childNodes, function (childNodeObject, i, allChildNodeObjects) {
							this.widgetNavigationTreeBufferNodesSet(childNodeObject);
						}, this);
				}
			},

		/**
		 * @returns {Object or null}
		 */
		widgetNavigationTreeDataGet: function () {
			var out = null,
				selections = this.selectionModel.getSelection();

			if (Ext.isArray(selections) && !Ext.isEmpty(selections)) {
				out = {};
				out[CMDBuild.core.constants.Proxy.OUTPUT] = selections;
			}

			return out;
		}
	});

})();
