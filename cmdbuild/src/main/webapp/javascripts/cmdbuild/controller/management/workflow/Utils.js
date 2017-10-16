(function () {

	Ext.define('CMDBuild.controller.management.workflow.Utils', {

		requires: ['CMDBuild.core.constants.WorkflowStates'],

		singleton: true,

		/**
		 * @param {String} status
		 *
		 * @returns {String}
		 */
		translateStatusFromCapitalizedMode: function (status) {
			switch (status) {
				case CMDBuild.core.constants.WorkflowStates.getOpenCapitalized():
					return CMDBuild.core.constants.WorkflowStates.getOpen();

				case CMDBuild.core.constants.WorkflowStates.getSuspendedCapitalized():
					return CMDBuild.core.constants.WorkflowStates.getSuspended();

				case CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized():
					return CMDBuild.core.constants.WorkflowStates.getCompleted();

				case CMDBuild.core.constants.WorkflowStates.getAbortedCapitalized():
					return CMDBuild.core.constants.WorkflowStates.getAborted();

				default:
					return status;
			}
		}
	});

})();
