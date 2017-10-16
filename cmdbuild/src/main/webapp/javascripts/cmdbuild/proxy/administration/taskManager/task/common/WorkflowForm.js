(function () {

	Ext.define('CMDBuild.proxy.administration.taskManager.task.common.WorkflowForm', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.model.administration.taskManager.task.common.workflowForm.Workflow'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStore: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.WORKFLOW, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.taskManager.task.common.workflowForm.Workflow',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.workflow.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.RESPONSE
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters super-processes
						return !record.get('superclass');
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllAttributes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attribute.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ATTRIBUTE, parameters);
		}
	});

})();
