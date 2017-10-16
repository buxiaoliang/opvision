(function () {

	Ext.define('CMDBuild.controller.administration.accordion.DataView', {
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
		 * @property {CMDBuild.view.administration.accordion.DataView}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.DataView', { delegate: this });

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
					text: CMDBuild.Translation.filterView,
					description: CMDBuild.Translation.filterView,
					id: this.cmfg('accordionBuildId', 'filter'),
					sectionHierarchy: ['filter'],
					leaf: true
				},
				{
					cmName: this.cmfg('accordionIdentifierGet'),
					text: CMDBuild.Translation.sqlView,
					description: CMDBuild.Translation.sqlView,
					id: this.cmfg('accordionBuildId', 'sql'),
					sectionHierarchy: ['sql'],
					leaf: true
				}
			]);

			this.updateStoreCommonEndpoint(parameters); // CallParent alias

			this.callParent(arguments);
		}
	});

})();
