(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Configuration', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.view.administration.accordion.Configuration}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.Configuration', { delegate: this });

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

			var nodes = [{
				cmName: this.cmfg('accordionIdentifierGet'),
				iconCls: 'cmdb-tree-configuration-icon',
				text: CMDBuild.Translation.generalOptions,
				description: CMDBuild.Translation.generalOptions,
				id: this.cmfg('accordionBuildId', 'generalOptions'),
				sectionHierarchy: ['generalOptions'],
				leaf: true
			}];

			if (!CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.CLOUD_ADMIN))
				nodes = Ext.Array.push(nodes, [
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.workflowEngine,
						description: CMDBuild.Translation.workflowEngine,
						id: this.cmfg('accordionBuildId', 'workflow'),
						sectionHierarchy: ['workflow'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.relationGraph,
						description: CMDBuild.Translation.relationGraph,
						id: this.cmfg('accordionBuildId', 'relationGraph'),
						sectionHierarchy: ['relationGraph'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.dms,
						description: CMDBuild.Translation.dms,
						id: this.cmfg('accordionBuildId', 'dms'),
						sectionHierarchy: ['dms'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.gis,
						description: CMDBuild.Translation.gis,
						id: this.cmfg('accordionBuildId', 'gis'),
						sectionHierarchy: ['gis'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.bim,
						description: CMDBuild.Translation.bim,
						id: this.cmfg('accordionBuildId', 'bim'),
						sectionHierarchy: ['bim'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.notifications,
						description: CMDBuild.Translation.notifications,
						id: this.cmfg('accordionBuildId', 'notifications'),
						sectionHierarchy: ['notifications'],
						leaf: true
					},
					{
						cmName: this.cmfg('accordionIdentifierGet'),
						iconCls: 'cmdb-tree-configuration-icon',
						text: CMDBuild.Translation.serverManagement,
						description: CMDBuild.Translation.serverManagement,
						id: this.cmfg('accordionBuildId', 'server'),
						sectionHierarchy: ['server'],
						leaf: true
					}
				]);

			this.view.getStore().getRootNode().removeAll();
			this.view.getStore().getRootNode().appendChild(nodes);

			this.updateStoreCommonEndpoint(parameters); // CallParent alias

			this.callParent(arguments);
		}
	});

})();
