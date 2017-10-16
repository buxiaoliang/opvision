(function () {

	/**
	 * Override to customize grid buttons disable action
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Grid', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Grid',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Attachment}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.attachment.GridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.form.tabs.attachment.Attachment} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.attachment.GridPanel', { delegate: this });
		}
	});

})();
