(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.toolbar.Top', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.Top',

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormMixinsToolbarFunctionsDisabledStateSet = panelModuleFormPanelToolbarTopDisabledStateSet',
			'panelModuleFormToolbarTopReset',
			'workflowFormToolbarTopToolbarTopUiUpdate = panelModuleFormToolbarTopUiUpdate'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.TopView'
		},

		/**
		 * @cfg {CMDBuild.view.management.workflow.panel.form.tabs.activityNew.toolbar.TopView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		panelModuleFormToolbarTopReset: function () {
			this.view.activityDescription.setText();
			this.view.activityPerformerName.setText();

			this.callParent(arguments);
		},

		/**
		 * General implementation to override on specific contexts
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		workflowFormToolbarTopToolbarTopUiUpdate: function () {
			this.view.activityDescription.setText(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.DESCRIPTION));
			this.view.activityPerformerName.setText(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.PERFORMER_NAME));

			switch (this.cmfg('workflowViewModeGet')) {
				case 'add':
				case 'edit':
					return this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: !this.cmfg('workflowSelectedWorkflowIsEmpty') });

				case 'readOnly':
					return this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', { state: true });

				case 'read':
				default: {
					this.cmfg('panelModuleFormPanelToolbarTopDisabledStateSet', {
						state: (
							this.cmfg('workflowSelectedWorkflowIsEmpty')
							|| this.cmfg('workflowSelectedInstanceIsEmpty')
							|| this.cmfg('workflowSelectedActivityIsEmpty')
							|| !this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE)
						)
					});

					this.view.buttonRemove.setDisabled(
						!(
							this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.STOPPABLE)
							&& (
								this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getOpenCapitalized()
								|| this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getSuspendedCapitalized()
							)
						)
					);
				}
			}
		}
	});

})();
