(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Bim', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.view.administration.accordion.Bim}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.Bim', { delegate: this });

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

			this.view.getStore().getRootNode().removeAll();
			this.view.getStore().getRootNode().appendChild([
				{
					cmName: 'bim-project',
					iconCls: 'cmdb-tree-bim-icon',
					text: CMDBuild.Translation.projects,
					description: CMDBuild.Translation.projects,
					id: this.cmfg('accordionBuildId', 'bim-project'),
					sectionHierarchy: ['bim-project'],
					leaf: true
				},
				{
					cmName: 'bim-layers',
					iconCls: 'cmdb-tree-bim-icon',
					text: CMDBuild.Translation.layers,
					description: CMDBuild.Translation.layers,
					id: this.cmfg('accordionBuildId', 'bim-layers'),
					sectionHierarchy: ['bim-layers'],
					leaf: true
				}
			]);

			this.updateStoreCommonEndpoint(parameters); // CallParent alias

			this.callParent(arguments);
		}
	});

})();
