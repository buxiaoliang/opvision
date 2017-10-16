(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Classes', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.administration.classes.Classes'
		],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.view.administration.accordion.Classes}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.MainViewport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.accordion.Classes', { delegate: this });

			this.cmfg('accordionUpdateStore');
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.loadMask
		 * @param {Number} parameters.selectionId
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		accordionUpdateStore: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.selectionId = Ext.isNumber(parameters.selectionId) ? parameters.selectionId : null;

			this.view.getStore().getRootNode().removeAll();

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = false;

			CMDBuild.proxy.administration.classes.Classes.readAll({
				params: params,
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					var nodes = [],
						standard = [],
						simple = [],
						standardNodesMap = {};

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						Ext.Array.forEach(decodedResponse, function (classObject, i, allClassObjects) {
							if (
								Ext.isObject(classObject) && !Ext.Object.isEmpty(classObject)
								&& classObject[CMDBuild.core.constants.Proxy.NAME] != CMDBuild.core.constants.Global.getRootNameClasses() // Discard root class of all classes
							) {
								var nodeObject = {};
								nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
								nodeObject[CMDBuild.core.constants.Proxy.TEXT] = classObject[CMDBuild.core.constants.Proxy.TEXT];
								nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = classObject[CMDBuild.core.constants.Proxy.TEXT];
								nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = classObject[CMDBuild.core.constants.Proxy.ID];
								nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', classObject[CMDBuild.core.constants.Proxy.ID]);
								nodeObject[CMDBuild.core.constants.Proxy.NAME] = classObject[CMDBuild.core.constants.Proxy.NAME];
								nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

								if (classObject[CMDBuild.core.constants.Proxy.TABLE_TYPE] == CMDBuild.core.constants.Global.getTableTypeSimpleTable()) {
									nodeObject['iconCls'] = 'cmdb-tree-class-icon';

									simple.push(nodeObject);
								} else { // Standard nodes map build
									nodeObject['iconCls'] = classObject['superclass'] ? 'cmdb-tree-superclass-icon' : 'cmdb-tree-class-icon';
									nodeObject[CMDBuild.core.constants.Proxy.PARENT] = classObject[CMDBuild.core.constants.Proxy.PARENT];

									standardNodesMap[nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID]] = nodeObject;
								}
							}
						}, this);

						// Builds full standard/simple classes trees
						for (var id in standardNodesMap) {
							var node = standardNodesMap[id];

							if (
								!Ext.isEmpty(node[CMDBuild.core.constants.Proxy.PARENT])
								&& !Ext.isEmpty(standardNodesMap[node[CMDBuild.core.constants.Proxy.PARENT]])
							) {
								var parentNode = standardNodesMap[node[CMDBuild.core.constants.Proxy.PARENT]];
								parentNode.children = parentNode.children || [];
								parentNode.children.push(node);
								parentNode[CMDBuild.core.constants.Proxy.LEAF] = false;
							} else {
								standard.push(node);
							}
						}

						// Manually sorting to avoid main classes group sorting
						CMDBuild.core.Utils.objectArraySort(standard, CMDBuild.core.constants.Proxy.TEXT);
						CMDBuild.core.Utils.objectArraySort(simple, CMDBuild.core.constants.Proxy.TEXT);

						if (Ext.isEmpty(simple)) {
							nodes = standard;
						} else {
							nodes = [
								{
									iconCls: 'cmdb-tree-superclass-icon',
									text: CMDBuild.Translation.standard,
									description: CMDBuild.Translation.standard,
									expanded: true,
									selectable: false,
									leaf: false,

									children: standard
								},
								{
									iconCls: 'cmdb-tree-superclass-icon',
									text: CMDBuild.Translation.simple,
									description: CMDBuild.Translation.simple,
									expanded: true,
									selectable: false,
									leaf: false,

									children: simple
								}
							];
						}

						if (!Ext.isEmpty(nodes))
							this.view.getStore().getRootNode().appendChild(nodes);
					}

					this.updateStoreCommonEndpoint(parameters); // CallParent alias
				}
			});

			this.callParent(arguments);
		}
	});

})();
