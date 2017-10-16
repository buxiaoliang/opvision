(function () {

	Ext.define('CMDBuild.controller.administration.accordion.NavigationTree', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.navigationTree.NavigationTree'
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
		 * @property {CMDBuild.view.administration.accordion.NavigationTree}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.NavigationTree', { delegate: this });

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

			CMDBuild.proxy.navigationTree.NavigationTree.readAll({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					var nodes = [];

					this.view.getStore().getRootNode().removeAll();

					if (!Ext.isEmpty(decodedResponse)) {
						Ext.Array.forEach(decodedResponse, function (treeObject, i, allTreeObjects) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-navigationTree-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = treeObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = treeObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = treeObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', treeObject[CMDBuild.core.constants.Proxy.NAME]);
							nodeObject[CMDBuild.core.constants.Proxy.NAME] = treeObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

							nodes.push(nodeObject);
						}, this);

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
