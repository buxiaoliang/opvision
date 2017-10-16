(function () {

	Ext.define('CMDBuild.controller.management.accordion.Dashboard', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.dashboard.Dashboard'
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
		 * @property {CMDBuild.view.management.accordion.Dashboard}
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

			this.view = Ext.create('CMDBuild.view.management.accordion.Dashboard', { delegate: this });

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

			CMDBuild.proxy.dashboard.Dashboard.readAllVisible({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE][CMDBuild.core.constants.Proxy.DASHBOARDS];

					var nodes = [];

					this.view.getStore().getRootNode().removeAll();

					if (!Ext.Object.isEmpty(decodedResponse)) {
						Ext.Object.each(decodedResponse, function (id, dashboardObject, myself) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-dashboard-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = dashboardObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = dashboardObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = id;
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', id);
							nodeObject[CMDBuild.core.constants.Proxy.NAME] = dashboardObject[CMDBuild.core.constants.Proxy.NAME];
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
