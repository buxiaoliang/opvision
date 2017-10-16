(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Menu', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.menu.Menu',
			'CMDBuild.core.Utils'
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
		 * @property {CMDBuild.view.administration.accordion.Menu}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.Menu', { delegate: this });

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

			CMDBuild.proxy.administration.menu.Menu.readAllGroups({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (result, options, decodedResult) {
					decodedResult = decodedResult[CMDBuild.core.constants.Proxy.GROUPS];

					this.view.getStore().getRootNode().removeAll();

					if (!Ext.isEmpty(decodedResult)) {
						CMDBuild.core.Utils.objectArraySort(decodedResult, CMDBuild.core.constants.Proxy.TEXT); // Use this method to avoid default group wrong sorting

						var nodes = [{
							cmName: this.cmfg('accordionIdentifierGet'),
							text: '* Default *',
							description: '* Default *',
							iconCls: 'cmdb-tree-group-icon',
							id: this.cmfg('accordionBuildId', 'default-group'),
							leaf: true
						}];

						Ext.Array.forEach(decodedResult, function (groupObject, i, allGroupObjects) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-group-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = groupObject[CMDBuild.core.constants.Proxy.TEXT];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = groupObject[CMDBuild.core.constants.Proxy.TEXT];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = groupObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', groupObject[CMDBuild.core.constants.Proxy.ID]);
							nodeObject[CMDBuild.core.constants.Proxy.NAME] = groupObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

							nodes.push(nodeObject);
						}, this);

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
