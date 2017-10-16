(function () {

	Ext.define('CMDBuild.controller.administration.accordion.UserAndGroup', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.Group'
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
		 * @property {CMDBuild.view.administration.accordion.UserAndGroup}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.UserAndGroup', { delegate: this });

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

			CMDBuild.proxy.administration.userAndGroup.group.Group.readAll({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (result, options, decodedResult) {
					decodedResult = decodedResult[CMDBuild.core.constants.Proxy.GROUPS];

					this.view.getStore().getRootNode().removeAll();

					if (!Ext.isEmpty(decodedResult)) {
						var nodes = [];

						Ext.Array.forEach(decodedResult, function (groupObject, i, allGroupObjects) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-group-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = groupObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = groupObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = groupObject[CMDBuild.core.constants.Proxy.ID];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', groupObject[CMDBuild.core.constants.Proxy.ID]);
							nodeObject[CMDBuild.core.constants.Proxy.SECTION_HIERARCHY] = ['group'];
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

							nodes.push(nodeObject);
						}, this);

						this.view.getStore().getRootNode().appendChild([
							{
								cmName: this.cmfg('accordionIdentifierGet'),
								iconCls: 'cmdb-tree-userGroup-icon',
								text: CMDBuild.Translation.groups,
								description: CMDBuild.Translation.groups,
								selectable: false,
								leaf: false,

								children: nodes
							},
							{
								cmName: this.cmfg('accordionIdentifierGet'),
								iconCls: 'cmdb-tree-user-icon',
								text: CMDBuild.Translation.users,
								description: CMDBuild.Translation.users,
								id: this.cmfg('accordionBuildId', 'user'),
								sectionHierarchy: ['user'],
								leaf: true
							}
						]);
						this.view.getStore().sort();
					}

					this.updateStoreCommonEndpoint(parameters); // CallParent alias
				}
			});

			this.callParent(arguments);
		}
	});

})();
