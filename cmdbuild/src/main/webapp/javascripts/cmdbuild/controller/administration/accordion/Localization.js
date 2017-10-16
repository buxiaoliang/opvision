(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Localization', {
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
		 * @property {CMDBuild.view.administration.accordion.Localization}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.Localization', { delegate: this });

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
					cmName: this.cmfg('accordionIdentifierGet'),
					iconCls: 'cmdb-tree-localization-icon',
					text: CMDBuild.Translation.configuration,
					description: CMDBuild.Translation.configuration,
					id: this.cmfg('accordionBuildId', 'configuration'),
					sectionHierarchy: ['configuration'],
					leaf: true
				},
				{
					cmName: this.cmfg('accordionIdentifierGet'),
					iconCls: 'cmdb-tree-localization-icon',
					text: CMDBuild.Translation.localization,
					description: CMDBuild.Translation.localization,
					id: this.cmfg('accordionBuildId', 'advancedTranslationsTable'),
					sectionHierarchy: ['advancedTranslationsTable'],
					leaf: true
				},
				{
					cmName: this.cmfg('accordionIdentifierGet'),
					iconCls: 'cmdb-tree-localization-icon',
					text: CMDBuild.Translation.importExport,
					description: CMDBuild.Translation.importExport,
					id: this.cmfg('accordionBuildId', 'importExport'),
					sectionHierarchy: ['importExport'],
					leaf: true
				}
			]);

			this.updateStoreCommonEndpoint(parameters); // CallParent alias

			this.callParent(arguments);
		}
	});

})();
