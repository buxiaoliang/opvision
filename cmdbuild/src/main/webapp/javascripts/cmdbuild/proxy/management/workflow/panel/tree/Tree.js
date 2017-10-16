(function () {

	Ext.define('CMDBuild.proxy.management.workflow.panel.tree.Tree', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.model.management.workflow.Node',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.proxy.management.workflow.panel.tree.Reader'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		getStore: function () {
			return Ext.create('Ext.data.TreeStore', {
				autoLoad: false,
				model: 'CMDBuild.model.management.workflow.Node',
				pageSize: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT),
				remoteSort: true,
				root: {
					expanded: true,
					loaded: true // Avoid a store load call on root expand event
				},
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.workflow.instance.readAll,
					reader: {
						type: 'workflowstore',
						totalProperty: CMDBuild.core.constants.Proxy.RESULTS
					}
				}
			});
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 */
		getStoreState: function () {
			return Ext.create('Ext.data.ArrayStore', {
				fields: [CMDBuild.core.constants.Proxy.DESCRIPTION, CMDBuild.core.constants.Proxy.VALUE],
				data: [
					[CMDBuild.Translation.open, CMDBuild.core.constants.WorkflowStates.getOpen()],
					[CMDBuild.Translation.suspended, CMDBuild.core.constants.WorkflowStates.getSuspended()],
					[CMDBuild.Translation.completed, CMDBuild.core.constants.WorkflowStates.getCompleted()],
					[CMDBuild.Translation.aborted, CMDBuild.core.constants.WorkflowStates.getAborted()],
					[CMDBuild.Translation.all, CMDBuild.core.constants.WorkflowStates.getAll()]
				]
			});
		},

		/**
		 * Get the position on the DB of the required activity, considering the sorting and current filter applied on the grid
		 *
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readPosition: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.workflow.getPosition });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters);
		}
	});

})();
