(function () {

	/**
	 * NOTE: this class doesn't manage show event to read data because of module custom behaviour
	 */
	Ext.define('CMDBuild.controller.administration.domain.tabs.EnabledClasses', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.domain.tabs.EnabledClasses'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.domain.Domain}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'domainTabEnabledClassesDataGet',
			'onDomainTabEnabledClassesAbortButtonClick',
			'onDomainTabEnabledClassesAddButtonClick',
			'onDomainTabEnabledClassesDomainSelected = onDomainDomainSelected',
			'onDomainTabEnabledClassesModifyButtonClick'
		],

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.enabledClasses.TreePanel}
		 */
		destinationTree: undefined,

		/**
		 * @cfg {Array}
		 */
		managedTreeTypes: ['destination', 'origin'],

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.enabledClasses.TreePanel}
		 */
		originTree: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.enabledClasses.EnabledClassesView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.domain.Domain} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.domain.tabs.enabledClasses.EnabledClassesView', { delegate: this });

			// Shorthands
			this.destinationTree = this.view.destinationTree;
			this.originTree = this.view.originTree;
		},

		/**
		 * @returns {Object} data
		 */
		domainTabEnabledClassesDataGet: function () {
			var data = {};
			var destinationDisabledClasses = [];
			var originDisabledClasses = [];

			// Get origin disabled classes
			this.getDisabledTreeVisit({
				node: this.originTree.getStore().getRootNode(),
				destinationArray: originDisabledClasses
			});

			// Get destination disabled classes
			this.getDisabledTreeVisit({
				node: this.destinationTree.getStore().getRootNode(),
				destinationArray: destinationDisabledClasses
			});

			data[CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES] = Ext.encode(originDisabledClasses);
			data[CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES] = Ext.encode(destinationDisabledClasses);

			return data;
		},

		/**
		 * @param {Array} decodedResponse
		 * @param {String} type
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		fillTreeStore: function (decodedResponse, type) {
			if (
				Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)
				&& Ext.isString(type) && !Ext.isEmpty(type)
				&& Ext.Array.contains(this.managedTreeTypes, type)
				&& !this.cmfg('domainSelectedDomainIsEmpty')
			) {
				var disabledClasses = [];
				var root = undefined;
				var rootData = {};
				var standard = [];

				// Get tree configurations by type
				switch (type) {
					case CMDBuild.core.constants.Proxy.DESTINATION: {
						root = this.destinationTree.getStore().getRootNode();
						disabledClasses = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES);

						rootData[CMDBuild.core.constants.Proxy.ID] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID);
						rootData[CMDBuild.core.constants.Proxy.NAME] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME);
					} break;

					case CMDBuild.core.constants.Proxy.ORIGIN: {
						root = this.originTree.getStore().getRootNode();
						disabledClasses = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES);

						rootData[CMDBuild.core.constants.Proxy.ID] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID);
						rootData[CMDBuild.core.constants.Proxy.NAME] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME);
					} break;
				}

				if (!Ext.isEmpty(root))
					root.removeAll();

				var nodesMap = {};

				Ext.Array.each(decodedResponse, function (classObject, index, allClasses) {
					if (
						classObject[CMDBuild.core.constants.Proxy.TYPE] == CMDBuild.core.constants.Global.getTableTypeClass() // Discard processes from visualization
						&& classObject[CMDBuild.core.constants.Proxy.NAME] != CMDBuild.core.constants.Global.getRootNameClasses() // Discard root class of all classes
						&& classObject[CMDBuild.core.constants.Proxy.TABLE_TYPE] != CMDBuild.core.constants.Global.getTableTypeSimpleTable() // Discard simple classes
					) {
						// Class node object
						var classMainNodeObject = {};
						classMainNodeObject['iconCls'] = classObject['superclass'] ? 'cmdb-tree-superclass-icon' : 'cmdb-tree-class-icon';
						classMainNodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = classObject[CMDBuild.core.constants.Proxy.TEXT];
						classMainNodeObject[CMDBuild.core.constants.Proxy.ENABLED] = !Ext.Array.contains(disabledClasses, classObject[CMDBuild.core.constants.Proxy.NAME]);
						classMainNodeObject[CMDBuild.core.constants.Proxy.ID] = classObject[CMDBuild.core.constants.Proxy.ID];
						classMainNodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;
						classMainNodeObject[CMDBuild.core.constants.Proxy.NAME] = classObject[CMDBuild.core.constants.Proxy.NAME];
						classMainNodeObject[CMDBuild.core.constants.Proxy.PARENT] = classObject[CMDBuild.core.constants.Proxy.PARENT];

						nodesMap[classMainNodeObject[CMDBuild.core.constants.Proxy.ID]] = classMainNodeObject;
					}
				}, this);

				// Builds full standard/simple classes trees
				for (var id in nodesMap) {
					var node = nodesMap[id];

					if (
						!Ext.isEmpty(node[CMDBuild.core.constants.Proxy.PARENT])
						&& !Ext.isEmpty(nodesMap[node[CMDBuild.core.constants.Proxy.PARENT]])
					) {
						var parentNode = nodesMap[node[CMDBuild.core.constants.Proxy.PARENT]];
						parentNode.children = parentNode.children || [];
						parentNode.children.push(node);
						parentNode[CMDBuild.core.constants.Proxy.LEAF] = false;
					} else {
						standard.push(node);
					}
				}

				// Build offspring tree
				if (!Ext.isEmpty(nodesMap[rootData[CMDBuild.core.constants.Proxy.ID]])) { // Node is class
					root.appendChild(nodesMap[rootData[CMDBuild.core.constants.Proxy.ID]]);
				} else { // Node is process so build custom node
					var customNodeObject = {};
					customNodeObject['iconCls'] = 'cmdb-tree-processclass-icon';
					customNodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = rootData[CMDBuild.core.constants.Proxy.NAME];
					customNodeObject[CMDBuild.core.constants.Proxy.ENABLED] = true;
					customNodeObject[CMDBuild.core.constants.Proxy.ID] = rootData[CMDBuild.core.constants.Proxy.ID];
					customNodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;
					customNodeObject[CMDBuild.core.constants.Proxy.NAME] = rootData[CMDBuild.core.constants.Proxy.NAME];

					root.appendChild(customNodeObject);
				}

				// Expand tree nodes
				switch (type) {
					case CMDBuild.core.constants.Proxy.DESTINATION: {
						this.destinationTree.expandAll();
					} break;

					case CMDBuild.core.constants.Proxy.ORIGIN: {
						this.originTree.expandAll();
					} break;
				}
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.node
		 * @param {Array} parameters.destinationArray
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		getDisabledTreeVisit: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isObject(parameters.node) && !Ext.Object.isEmpty(parameters.node)
				&& Ext.isArray(parameters.destinationArray)
			) {
				var node = parameters.node;
				var destinationArray = parameters.destinationArray;

				node.eachChild(function (childNode) {
					if (!childNode.hasChildNodes() && !childNode.get(CMDBuild.core.constants.Proxy.ENABLED))
						destinationArray.push(childNode.get(CMDBuild.core.constants.Proxy.NAME));

					if (node.hasChildNodes())
						this.getDisabledTreeVisit({
							node: childNode,
							destinationArray: destinationArray
						});
				}, this);
			} else {
				_error('getDisabledTreeVisit(): wrong parameters', this, parameters);
			}
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabEnabledClassesAbortButtonClick: function () {
			if (!this.cmfg('domainSelectedDomainIsEmpty')) {
				this.cmfg('onDomainTabEnabledClassesDomainSelected');
			} else {
				this.view.reset();
				this.view.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabEnabledClassesAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Enable/Disable tab on domain selection
		 * Works also as show event
		 *
		 * @returns {Void}
		 */
		onDomainTabEnabledClassesDomainSelected: function () {
			this.view.setDisabled(this.cmfg('domainSelectedDomainIsEmpty'));

			// Read all classes to get default translations
			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.administration.domain.tabs.EnabledClasses.readEntryTypes({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					this.view.setDisabledModify(true, true);

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						this.fillTreeStore(decodedResponse, CMDBuild.core.constants.Proxy.DESTINATION);
						this.fillTreeStore(decodedResponse, CMDBuild.core.constants.Proxy.ORIGIN);
					} else {
						_error('onDomainTabEnabledClassesDomainSelected(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabEnabledClassesModifyButtonClick: function () {
			this.view.setDisabledModify(false);
		}
	});

})();
