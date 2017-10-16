(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.user.User', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.GridAndForm',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.administration.userAndGroup.user.User'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.user.UserAndGroup}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupUserAbortButtonClick',
			'onUserAndGroupUserAccordionSelected = onUserAndGroupAccordionSelected',
			'onUserAndGroupUserAddButtonClick',
			'onUserAndGroupUserChangePasswordButtonClick',
			'onUserAndGroupUserDisableButtonClick',
			'onUserAndGroupUserModifyButtonClick = onUserAndGroupUserItemDoubleClick',
			'onUserAndGroupUserPrivilegedChange',
			'onUserAndGroupUserRowSelected',
			'onUserAndGroupUserSaveButtonClick',
			'onUserAndGroupUserServiceChange',
			'onUserAndGroupUserShow',
			'userAndGroupUserGridFilterApply = panelGridAndFormGridFilterApply',
			'userAndGroupUserGridFilterClear = panelGridAndFormGridFilterClear',
			'userAndGroupUserGridStoreGet = panelGridAndFormListPanelStoreGet',
			'userAndGroupUserGridStoreLoad = panelGridAndFormListPanelStoreLoad'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		controllerToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.administration.userAndGroup.user.User}
		 *
		 * @private
		 */
		selectedUser: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.UserView}
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

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.user.UserView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
			this.grid = this.view.grid;

			// Build sub-controllers
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				parentDelegate: this,
				enableFilterBasic: true
			});

			// Add docked
			this.grid.addDocked([
				this.controllerToolbarPaging.getView()
			]);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAbortButtonClick: function () {
			if (!this.userAndGroupUserSelectedUserIsEmpty()) {
				this.cmfg('onUserAndGroupUserRowSelected');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAccordionSelected: function () {
			if (
				!this.cmfg('userAndGroupSelectedAccordionIsEmpty')
				&& this.cmfg('userAndGroupSelectedAccordionGet', CMDBuild.core.constants.Proxy.SECTION_HIERARCHY)[0] == 'user'
			) {
				this.cmfg('userAndGroupViewTitleSet', this.getBaseTitle());
				this.cmfg('userAndGroupViewActiveItemSet', this.view);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserAddButtonClick: function () {
			this.grid.getSelectionModel().deselectAll();

			this.userAndGroupUserSelectedUserReset();

			this.form.reset();
			this.form.setDisabledModify(false, true);
			this.form.defaultGroupCombo.setDisabled(true);
			this.form.loadRecord(Ext.create('CMDBuild.model.administration.userAndGroup.user.User'));
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserChangePasswordButtonClick: function () {
			this.form.setDisabledFieldSet(this.form.userPasswordFieldSet, false);
			this.form.setDisabledTopBar(true);
			this.form.setDisabledBottomBar(false);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserDisableButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.DISABLE] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ACTIVE);

			CMDBuild.proxy.administration.userAndGroup.user.User.disable({
				params: params,
				scope: this,
				success: this.success
			});
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserModifyButtonClick: function () {
			this.form.setDisabledFieldSet(this.form.userInfoFieldSet, false);
			this.form.setDisabledTopBar(true);
			this.form.setDisabledBottomBar(false);
		},

		/**
		 * Privileged is a specialization of service, so if someone check privileged is implicit that is a service user
		 *
		 * @returns {Void}
		 */
		onUserAndGroupUserPrivilegedChange: function () {
			if (this.form.privilegedCheckbox.getValue())
				this.form.serviceCheckbox.setValue(true);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserRowSelected: function () {
			if (this.grid.getSelectionModel().hasSelection()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ID] = this.grid.getSelectionModel().getSelection()[0].get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.userAndGroup.user.User.read({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						// Error handling
							if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
								return _error('onUserAndGroupUserRowSelected(): unmanaged response', this, decodedResponse);
						// END: Error handling

						this.userAndGroupUserSelectedUserSet({ value: decodedResponse });

						this.form.reset();
						this.form.setDisabledModify(true, true);
						this.form.getForm().loadRecord(this.userAndGroupUserSelectedUserGet());

						// Update buttonToggleEnableDisable button
						this.form.buttonToggleEnableDisable.setActiveState(this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ACTIVE));

						var params = {};
						params[CMDBuild.core.constants.Proxy.ID] = this.userAndGroupUserSelectedUserGet(CMDBuild.core.constants.Proxy.ID);

						this.form.defaultGroupCombo.getStore().load({ params: params });
					}
				})
			}
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for a refactor (new CRUD standards)
		 */
		onUserAndGroupUserSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var params = this.form.getData(true);

				if (Ext.isEmpty(params[CMDBuild.core.constants.Proxy.ID])) {
					params[CMDBuild.core.constants.Proxy.ID] = -1;

					CMDBuild.proxy.administration.userAndGroup.user.User.create({
						params: params,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.userAndGroup.user.User.update({
						params: params,
						scope: this,
						success: this.success
					});
				}
			}
		},

		/**
		 * Privileged is a specialization of service, so if someone uncheck service is implicit that is not a privileged user
		 *
		 * @returns {Void}
		 */
		onUserAndGroupUserServiceChange: function () {
			if (!this.form.serviceCheckbox.getValue())
				this.form.privilegedCheckbox.setValue(false);
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupUserShow: function () {
			this.controllerToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingFilterBasicReset');

			this.cmfg('userAndGroupUserGridStoreLoad', {
				scope: this,
				callback: function (records, operation, success) {
					if (!this.grid.getSelectionModel().hasSelection())
						this.grid.getSelectionModel().select(0);
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.id
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readPosition: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('readPosition(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			var sort = this.cmfg('userAndGroupUserGridStoreGet').getSorters()

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = parameters.id;

			if (Ext.isArray(sort) && !Ext.isEmpty(sort))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sort);

			CMDBuild.proxy.administration.userAndGroup.user.User.readPosition({
				params: params,
				scope: parameters.scope,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
						if (!Ext.isNumber(decodedResponse) || Ext.isEmpty(decodedResponse))
							return _error('readPosition(): unmanaged response', this, decodedResponse);
					// END: Error handling

					if (Ext.isFunction(parameters.callback))
						Ext.callback(parameters.callback, parameters.scope, [decodedResponse]);
				}
			});
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
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('success(): unmanaged response', this, decodedResponse);
			// END: Error handling

			this.view.includeDisabledUsers.reset(); // Reset checkbox value to load all users on save

			this.readPosition({
				id: decodedResponse[CMDBuild.core.constants.Proxy.ID],
				scope: this,
				callback: function (position) {
					this.cmfg('userAndGroupUserGridStoreLoad', {
						page: CMDBuild.core.Utils.getPageNumber(position),
						scope: this,
						callback: function (records, operation, success) {
							this.grid.getSelectionModel().deselectAll();
							this.grid.getSelectionModel().select(
								position % CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT)
							);

							this.form.setDisabledModify(true);
						}
					});
				}
			});
		},

		// SelectedUser property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserReset: function () {
				this.propertyManageReset('selectedUser');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupUserSelectedUserSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.userAndGroup.user.User';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedUser';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.field.filter.basic.Filter} parameters.filter
		 *
		 * @returns {Void}
		 */
		userAndGroupUserGridFilterApply: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.filter) || Ext.Object.isEmpty(parameters.filter))
					return _error('userAndGroupUserGridFilterApply(): unmanaged filter parameter', this, parameters.filter);
			// END: Error handling

			this.cmfg('userAndGroupUserGridStoreLoad', {
				params: {
					filter: Ext.encode(parameters.filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION))
				}
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.disableStoreLoad
		 *
		 * @returns {Void}
		 */
		userAndGroupUserGridFilterClear: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

			if (!parameters.disableStoreLoad)
				this.cmfg('userAndGroupUserGridStoreLoad');
		},

		/**
		 * @returns {Ext.data.Store}
		 */
		userAndGroupUserGridStoreGet: function () {
			return this.grid.getStore();
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.params
		 * @param {String} parameters.params.filter
		 * @param {Number} parameters.page
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		userAndGroupUserGridStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			var params = parameters.params;
			params[CMDBuild.core.constants.Proxy.ACTIVE_ONLY] = this.view.includeDisabledUsers.getValue();

			this.cmfg('userAndGroupUserGridStoreGet').getProxy().extraParams = params; // Setup extraParams to work also with column header click

			this.cmfg('userAndGroupUserGridStoreGet').loadPage(parameters.page, {
				params: params,
				scope: parameters.scope,
				callback: parameters.callback
			});
		}
	});

})();
