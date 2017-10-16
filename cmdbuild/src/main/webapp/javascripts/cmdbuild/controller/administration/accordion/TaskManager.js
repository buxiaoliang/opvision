(function () {

	Ext.define('CMDBuild.controller.administration.accordion.TaskManager', {
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
		 * @property {CMDBuild.view.administration.accordion.TaskManager}
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

			this.view = Ext.create('CMDBuild.view.administration.accordion.TaskManager', { delegate: this });

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
					iconCls: 'cmdb-tree-taskGroup-icon',
					text: CMDBuild.Translation.all,
					description: CMDBuild.Translation.all,
					id: this.cmfg('accordionBuildId', 'all'),
					sectionHierarchy: ['all'],
					leaf: false,

					children: [
						{
							cmName: this.cmfg('accordionIdentifierGet'),
							iconCls: 'cmdb-tree-tasks-icon',
							text: CMDBuild.Translation.connector,
							description: CMDBuild.Translation.connector,
							id: this.cmfg('accordionBuildId', 'connector'),
							sectionHierarchy: ['connector'],
							leaf: true
						},
						{
							cmName: this.cmfg('accordionIdentifierGet'),
							iconCls: 'cmdb-tree-tasks-icon',
							text: CMDBuild.Translation.email,
							description: CMDBuild.Translation.email,
							id: this.cmfg('accordionBuildId', 'email'),
							sectionHierarchy: ['email'],
							leaf: true
						},
						{
							cmName: this.cmfg('accordionIdentifierGet'),
							iconCls: 'cmdb-tree-taskGroup-icon',
							text: CMDBuild.Translation.event,
							description: CMDBuild.Translation.event,
							expanded: true,
							id: this.cmfg('accordionBuildId', 'event'),
							sectionHierarchy: ['event'],
							leaf: false,

							children: [
								{
									cmName: this.cmfg('accordionIdentifierGet'),
									iconCls: 'cmdb-tree-tasks-icon',
									text: CMDBuild.Translation.asynchronous,
									description: CMDBuild.Translation.asynchronous,
									id: this.cmfg('accordionBuildId', 'event_asynchronous'),
									sectionHierarchy: ['event', 'asynchronous'],
									leaf: true
								},
								{
									cmName: this.cmfg('accordionIdentifierGet'),
									iconCls: 'cmdb-tree-tasks-icon',
									text: CMDBuild.Translation.synchronous,
									description: CMDBuild.Translation.synchronous,
									id: this.cmfg('accordionBuildId', 'event_synchronous'),
									sectionHierarchy: ['event', 'synchronous'],
									leaf: true
								}
							]
						},
						{
							cmName: this.cmfg('accordionIdentifierGet'),
							iconCls: 'cmdb-tree-tasks-icon',
							text: CMDBuild.Translation.workflow,
							description: CMDBuild.Translation.workflow,
							id: this.cmfg('accordionBuildId', 'workflow'),
							sectionHierarchy: ['workflow'],
							leaf: true
						},
						{
							cmName: this.cmfg('accordionIdentifierGet'),
							iconCls: 'cmdb-tree-taskGroup-icon',
							text: CMDBuild.Translation.others,
							description: CMDBuild.Translation.others,
							expanded: true,
							id: this.cmfg('accordionBuildId', 'others'),
							sectionHierarchy: ['generic'],
							leaf: false,

							children: [
								{
									cmName: this.cmfg('accordionIdentifierGet'),
									iconCls: 'cmdb-tree-tasks-icon',
									text: CMDBuild.Translation.sendEmail,
									description: CMDBuild.Translation.sendEmail,
									id: this.cmfg('accordionBuildId', 'generic'),
									sectionHierarchy: ['generic'],
									leaf: true
								}
							]
						}
					]
				}
			]);

			this.updateStoreCommonEndpoint(parameters); // CallParent alias

			this.callParent(arguments);
		}
	});

})();
