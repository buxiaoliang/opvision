(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Workflow', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.workflow.Workflow'
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
		 * @property {CMDBuild.view.administration.accordion.Workflow}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.Workflow', {
				delegate: this,
				disabled: !CMDBuild.configuration.workflow.get(CMDBuild.core.constants.Proxy.ENABLED)
			});

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

			CMDBuild.proxy.administration.workflow.Workflow.readAll({
				params: params,
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					var nodes = [];
					var nodesMap = {};

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						Ext.Array.forEach(decodedResponse, function (classObject, i, allClassObjects) {
							if (
								Ext.isObject(classObject) && !Ext.Object.isEmpty(classObject)
								&& classObject[CMDBuild.core.constants.Proxy.NAME] != CMDBuild.core.constants.Global.getRootNameWorkflows() // Discard root workflow of all Workflows
							) {
								var nodeObject = {};
								nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
								nodeObject['iconCls'] = classObject['superclass'] ? 'cmdb-tree-superprocessclass-icon' : 'cmdb-tree-processclass-icon';
								nodeObject[CMDBuild.core.constants.Proxy.TEXT] = classObject[CMDBuild.core.constants.Proxy.TEXT];
								nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = classObject[CMDBuild.core.constants.Proxy.TEXT];
								nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = classObject[CMDBuild.core.constants.Proxy.ID];
								nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', classObject[CMDBuild.core.constants.Proxy.ID]);
								nodeObject[CMDBuild.core.constants.Proxy.PARENT] = classObject[CMDBuild.core.constants.Proxy.PARENT];
								nodeObject[CMDBuild.core.constants.Proxy.NAME] = classObject[CMDBuild.core.constants.Proxy.NAME];
								nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

								nodesMap[nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID]] = nodeObject;
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
								nodes.push(node);
							}
						}

						if (!Ext.isEmpty(nodes)) {
							this.view.getStore().getRootNode().appendChild(nodes);
							this.view.getStore().sort();
						}
					}

					this.updateStoreCommonEndpoint(parameters); // CallParent alias
				}
			});

			this.callParent(arguments);
		}
	});

})();
