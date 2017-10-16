(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.Properties', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.Group'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.Group}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabPropertiesAbortButtonClick',
			'onUserAndGroupGroupTabPropertiesActiveStateToggleButtonClick',
			'onUserAndGroupGroupTabPropertiesAddButtonClick',
			'onUserAndGroupGroupTabPropertiesGroupSelected = onUserAndGroupGroupTabGroupSelected',
			'onUserAndGroupGroupTabPropertiesModifyButtonClick',
			'onUserAndGroupGroupTabPropertiesSaveButtonClick',
			'onUserAndGroupGrouptabPropertiesShow'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.properties.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.properties.PropertiesView}
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

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.properties.PropertiesView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPropertiesAbortButtonClick: function () {
			if (!this.cmfg('userAndGroupGroupSelectedGroupIsEmpty')) {
				this.cmfg('onUserAndGroupGrouptabPropertiesShow');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPropertiesActiveStateToggleButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.IS_ACTIVE] = !this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.IS_ACTIVE);

			CMDBuild.proxy.administration.userAndGroup.group.Group.enableDisable({
				params: params,
				scope: this,
				success: this.success
			});
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPropertiesAddButtonClick: function () {
			this.form.reset();
			this.form.loadRecord(Ext.create('CMDBuild.model.administration.userAndGroup.group.Group'));
			this.form.setDisabledModify(false, true);
		},

		/**
		 * Enable/Disable tab on group selection
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPropertiesGroupSelected: function () {
			this.view.enable();

			this.form.reset();
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPropertiesModifyButtonClick: function () {
			this.form.setDisabledModify(false);
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for a refactor (CRUD)
		 */
		onUserAndGroupGroupTabPropertiesSaveButtonClick: function () {
			if (this.validate(this.form)) { // Validate before save
				var params = this.form.getData(true);

				if (Ext.isEmpty(params[CMDBuild.core.constants.Proxy.ID])) {
					params[CMDBuild.core.constants.Proxy.ID] = -1;

					CMDBuild.proxy.administration.userAndGroup.group.Group.create({
						params: params,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.userAndGroup.group.Group.update({
						params: params,
						scope: this,
						success: this.success
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (crud)
		 */
		onUserAndGroupGrouptabPropertiesShow: function () {
			if (!this.cmfg('userAndGroupGroupSelectedGroupIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = false;

				this.form.startingClassCombo.getStore().load({
					params: params,
					scope: this,
					callback: function (records, operation, success) {
						this.form.reset();
						this.form.setDisabledModify(true, true);
						this.form.loadRecord(this.cmfg('userAndGroupGroupSelectedGroupGet'));
						this.form.activeStateToggleButton.setActiveState(this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.IS_ACTIVE));
					}
				});
			}
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		success: function (response, options, decodedResponse) {
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.GROUP];

			this.form.setDisabledModify(true);

			this.cmfg('mainViewportAccordionDeselect', this.cmfg('identifierGet'));
			this.cmfg('mainViewportAccordionControllerUpdateStore', {
				identifier: this.cmfg('identifierGet'),
				params: {
					selectionId: decodedResponse[CMDBuild.core.constants.Proxy.ID]
				}
			});
		}
	});

})();
