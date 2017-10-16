(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.Group', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.Group'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.UserAndGroup}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupAccordionSelected = onUserAndGroupAccordionSelected',
			'onUserAndGroupGroupAddButtonClick',
			'onUserAndGroupGroupTabGroupSelected -> controllerProperties, controllerPrivileges, controllerUsers, controllerUserInterface, controllerDefaultFilters',
			'onUserAndGroupGroupSetActiveTab',
			'userAndGroupGroupSelectedGroupGet',
			'userAndGroupGroupSelectedGroupIsEmpty',
			'userAndGroupGroupSelectedGroupReset',
			'userAndGroupGroupSelectedGroupSet'
		],

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.DefaultFilters}
		 */
		controllerDefaultFilters: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges}
		 */
		controllerPrivileges: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.Properties}
		 */
		controllerProperties: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.UserInterface}
		 */
		controllerUserInterface: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.Users}
		 */
		controllerUsers: undefined,

		/**
		 * @property {CMDBuild.model.lookup.Type} or null
		 *
		 * @private
		 */
		selectedGroup: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.GroupView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.userAndGroup.user.UserAndGroup} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.GroupView', { delegate: this });

			// Shorthands
			this.tabPanel = this.view.tabPanel;

			this.tabPanel.removeAll();

			// Build sub-controllers
			this.controllerDefaultFilters = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.DefaultFilters', { parentDelegate: this });
			this.controllerPrivileges = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges', { parentDelegate: this });
			this.controllerProperties = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.Properties', { parentDelegate: this });
			this.controllerUserInterface = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.UserInterface', { parentDelegate: this });
			this.controllerUsers = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.Users', { parentDelegate: this });

			// Inject tabs (sorted)
			this.tabPanel.add([
				this.controllerProperties.getView(),
				this.controllerPrivileges.getView(),
				this.controllerUsers.getView(),
				this.controllerUserInterface.getView(),
				this.controllerDefaultFilters.getView()
			]);

			this.cmfg('onUserAndGroupGroupSetActiveTab');
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (crud)
		 */
		onUserAndGroupGroupAccordionSelected: function () {
			if (
				!this.cmfg('userAndGroupSelectedAccordionIsEmpty')
				&& this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.SECTION_HIERARCHY)[0] == 'group'
			) {
				CMDBuild.proxy.administration.userAndGroup.group.Group.read({
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.GROUPS];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							var selectedGroup = Ext.Array.findBy(decodedResponse, function (groupObject, i) {
								return this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.ID) == groupObject[CMDBuild.core.constants.Proxy.ID];
							}, this);

							if (Ext.isObject(selectedGroup) && !Ext.Object.isEmpty(selectedGroup)) {
								this.cmfg('userAndGroupGroupSelectedGroupSet', { value: selectedGroup });

								this.cmfg('onUserAndGroupGroupTabGroupSelected');

								// Setup main view
								var titleParts = [this.getBaseTitle()];

								if (!this.cmfg('userAndGroupSelectedAccordionIsEmpty', CMDBuild.core.constants.Proxy.DESCRIPTION))
									titleParts.push(this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

								this.cmfg('userAndGroupViewTitleSet', titleParts);
								this.cmfg('userAndGroupViewActiveItemSet', this.view);

								// Manage tab selection
								if (Ext.isEmpty(this.tabPanel.getActiveTab()))
									this.tabPanel.setActiveTab(0);

								this.tabPanel.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected
							} else {
								_error('onUserAndGroupGroupAccordionSelected(): group not found', this, this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.ID));
							}
						}
					}
				});
			} else {
				this.cmfg('onUserAndGroupGroupTabGroupSelected');

				// Manage tab selection
				if (Ext.isEmpty(this.tabPanel.getActiveTab()))
					this.tabPanel.setActiveTab(0);

				this.tabPanel.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupAddButtonClick: function () {
			this.cmfg('onUserAndGroupGroupSetActiveTab');

			this.cmfg('mainViewportAccordionDeselect', this.cmfg('userAndGroupIdentifierGet'));
			this.cmfg('userAndGroupGroupSelectedGroupReset');

			this.cmfg('userAndGroupViewTitleSet', this.getBaseTitle());

			this.controllerDefaultFilters.cmfg('onUserAndGroupGroupTabDefaultFiltersAddButtonClick');
			this.controllerPrivileges.cmfg('onUserAndGroupGroupTabPrivilegesAddButtonClick');
			this.controllerProperties.cmfg('onUserAndGroupGroupTabPropertiesAddButtonClick');
			this.controllerUserInterface.cmfg('onUserAndGroupGroupTabUserInterfaceAddButtonClick');
			this.controllerUsers.cmfg('onUserAndGroupGroupTabUsersAddButtonClick');
		},

		/**
		 * @param {Number} index
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupSetActiveTab: function (index) {
			index = Ext.isEmpty(index) ? 0 : index;

			this.tabPanel.setActiveTab(index);
		},

		// SelectedGroup property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			userAndGroupGroupSelectedGroupGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedGroup';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			userAndGroupGroupSelectedGroupIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedGroup';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 */
			userAndGroupGroupSelectedGroupReset: function () {
				this.propertyManageReset('selectedGroup');
			},

			/**
			 * @property {Object} parameters
			 *
			 * @returns {Void}
			 */
			userAndGroupGroupSelectedGroupSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.userAndGroup.group.Group';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedGroup';

					this.propertyManageSet(parameters);
				}
			}
	});

})();
