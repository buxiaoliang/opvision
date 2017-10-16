(function () {

	Ext.define('CMDBuild.controller.management.accordion.Report', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.report.Report'
		],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Boolean}
		 */
		hideIfEmpty: true,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.view.management.accordion.Report}
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

			this.view = Ext.create('CMDBuild.view.management.accordion.Report', { delegate: this });

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

			CMDBuild.proxy.report.Report.readTypesTree({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					if (!Ext.isEmpty(decodedResponse) && Ext.isArray(decodedResponse)) {
						var nodes = [];

						Ext.Array.forEach(decodedResponse, function (reportObject, i, allReportObjects) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-report-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = reportObject[CMDBuild.core.constants.Proxy.TEXT];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = reportObject[CMDBuild.core.constants.Proxy.TEXT];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = reportObject[CMDBuild.core.constants.Proxy.ID];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', reportObject[CMDBuild.core.constants.Proxy.ID]);
							nodeObject[CMDBuild.core.constants.Proxy.SECTION_HIERARCHY] = ['custom'];
							nodeObject[CMDBuild.core.constants.Proxy.NAME] = reportObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

							nodes.push(nodeObject);
						}, this);

						if (!Ext.isEmpty(nodes)) {
							this.view.getStore().getRootNode().removeAll();
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
