(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.Group}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabPrivilegesAddButtonClick',
			'onUserAndGroupGroupTabPrivilegesGroupSelected = onUserAndGroupGroupTabGroupSelected',
			'onUserAndGroupGroupTabPrivilegesShow'
		],

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Classes}
		 */
		controllerClassPrivileges: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.CustomPage}
		 */
		controllerCustomPageProperties: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.DataView}
		 */
		controllerDataViewProperties: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Filter}
		 */
		controllerFilterProperties: undefined,

		/**
		 * @property {CMDBuild.controller.administration..userAndGroup.group.privileges.Grid}
		 */
		controllerWorkflowPrivileges: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.privileges.PrivilegesView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.userAndGroup.group.Group} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.privileges.PrivilegesView', { delegate: this });

			// Controller build
			this.controllerClassPrivileges = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Classes', { parentDelegate: this });
			this.controllerCustomPageProperties = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.CustomPage', { parentDelegate: this });
			this.controllerDataViewProperties = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.DataView', { parentDelegate: this });
			this.controllerFilterProperties = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Filter', { parentDelegate: this });
			this.controllerWorkflowPrivileges = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Workflow', { parentDelegate: this });

			// Inject tabs (sorted)
			this.view.add([
				this.controllerClassPrivileges.getView(),
				this.controllerWorkflowPrivileges.getView(),
				this.controllerDataViewProperties.getView(),
				this.controllerFilterProperties.getView(),
				this.controllerCustomPageProperties.getView()
			]);
		},

		/**
		 * Disable tab on add button click
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Enable/Disable tab evaluating group privileges, administrator groups have full privileges so panel is disabled
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesGroupSelected: function () {
			this.view.setDisabled(this.cmfg('userAndGroupGroupSelectedGroupIsEmpty') || this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.IS_ADMINISTRATOR));
		},

		/**
		 * Evaluate group privileges to set active first tab
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesShow: function () {
			if (!this.cmfg('userAndGroupGroupSelectedGroupIsEmpty') && this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.IS_ADMINISTRATOR)) {
				this.cmfg('onUserAndGroupGroupSetActiveTab');
			} else {
				// Manage tab selection
				if (Ext.isEmpty(this.view.getActiveTab()))
					this.view.setActiveTab(0);

				this.view.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected
			}
		}
	});

})();
