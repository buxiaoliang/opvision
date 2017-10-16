(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.UserAndGroup', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'identifierGet = userAndGroupIdentifierGet',
			'onUserAndGroupAccordionSelected -> controllerGroups, controllerUsers',
			'onUserAndGroupModuleInit = onModuleInit',
			'setViewTitle = userAndGroupViewTitleSet',
			'userAndGroupSelectedAccordionGet',
			'userAndGroupSelectedAccordionIsEmpty',
			'userAndGroupViewActiveItemSet'
		],

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @parameter {CMDBuild.model.administration.userAndGroup.SelectedAccordion}
		 *
		 * @private
		 */
		selectedAccordion: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.Group}
		 */
		controllerGroups: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.user.User}
		 */
		controllerUsers: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.userAndGroup.UserAndGroupView}
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

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.UserAndGroupView', { delegate: this });

			// Build sub-controllers
			this.controllerGroups = Ext.create('CMDBuild.controller.administration.userAndGroup.group.Group', { parentDelegate: this });
			this.controllerUsers = Ext.create('CMDBuild.controller.administration.userAndGroup.user.User', { parentDelegate: this });

			// Build view
			this.view.add([
				this.controllerGroups.getView(),
				this.controllerUsers.getView()
			]);

			this.cmfg('userAndGroupViewActiveItemSet');
		},

		/**
		 * Setup view items and controllers on accordion click
		 *
		 * @param {CMDBuild.model.common.Accordion} node
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onUserAndGroupModuleInit: function (node) {
			if (Ext.isObject(node) && !Ext.Object.isEmpty(node)) {
				var selectedAccordionData = node.getData();
				selectedAccordionData[CMDBuild.core.constants.Proxy.ID] = selectedAccordionData[CMDBuild.core.constants.Proxy.ENTITY_ID];

				this.userAndGroupSelectedAccordionSet({ value: selectedAccordionData });

				this.cmfg('onUserAndGroupAccordionSelected');

				this.onModuleInit(node); // Custom callParent() implementation
			}
		},

		// SelectedAccordion property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @return {Mixed or undefined}
			 */
			userAndGroupSelectedAccordionGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @return {Mixed or undefined}
			 */
			userAndGroupSelectedAccordionIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupSelectedAccordionSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.userAndGroup.SelectedAccordion';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAccordion';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Void}
		 */
		userAndGroupViewActiveItemSet: function (item) {
			if (Ext.isObject(item) && !Ext.Object.isEmpty(item))
				return this.view.getLayout().setActiveItem(item);

			// Display group panel as default
			return this.view.getLayout().setActiveItem(this.controllerGroups.getView());
		}
	});

})();
