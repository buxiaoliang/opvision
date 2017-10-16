(function () {

	/**
	 * Extends original view to implement function to select tab on widget button click
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.tabs.email.Email', {
		extend: 'CMDBuild.view.management.common.tabs.email.EmailView',

		requires: ['CMDBuild.core.constants.Proxy'],


		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.Email}
		 */
		delegate: undefined,

		/**
		 * @returns {Void}
		 */
		cmActivate: function () {
			this.setDisabled(false);

			this.delegate.parentDelegate.tabPanel.setActiveTab(this);
		}
	});

})();
