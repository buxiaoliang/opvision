(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.Users', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.Users'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.Group}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.common.field.filter.basic.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabUsersAddButtonClick',
			'onUserAndGroupGroupTabUsersGroupSelected = onUserAndGroupGroupTabGroupSelected',
			'onUserAndGroupGroupTabUsersSaveButtonClick',
			'onUserAndGroupGroupTabUsersShow',
			'userAndGroupGroupTabUsersGridAvailableFilterApply = panelGridAndFormGridFilterApply',
			'userAndGroupGroupTabUsersGridAvailableFilterClear = panelGridAndFormGridFilterClear',
			'userAndGroupGroupTabUsersGridAvailableStoreGet = panelGridAndFormListPanelStoreGet',
			'userAndGroupGroupTabUsersGridAvailableStoreLoad = panelGridAndFormListPanelStoreLoad',
			'userAndGroupGroupTabUsersGridSelectedStoreLoad'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging}
		 */
		controllerGridAvailableToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.AvailableGridPanel}
		 */
		gridAvailable: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.SelectedGridPanel}
		 */
		gridSelected: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.users.UsersView}
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

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.users.UsersView', { delegate: this });

			// Shorthands
			this.gridAvailable = this.view.gridAvailable;
			this.gridSelected = this.view.gridSelected;

			// Build sub-controllers
			this.controllerGridAvailableToolbarPaging = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.toolbar.Paging', {
				parentDelegate: this,
				enableFilterBasic: true
			});

			// Add docked
			this.gridAvailable.addDocked([
				this.controllerGridAvailableToolbarPaging.getView()
			]);
		},

		/**
		 * Disable tab on add button click
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Enable/Disable tab evaluating selected group
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersGroupSelected: function () {
			this.view.setDisabled(this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'));
		},

		/**
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (use a JsonArray of id not a string)
		 */
		onUserAndGroupGroupTabUsersSaveButtonClick: function () {
			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('onUserAndGroupGroupTabUsersSaveButtonClick(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			var usersIdArray = [];

			Ext.Array.forEach(this.userAndGroupGroupTabUsersGridSelectedStoreGet().getRange(), function (record, i, allRecords) {
				usersIdArray.push(record.get(CMDBuild.core.constants.Proxy.ID));
			}, this);

			usersIdArray = Ext.Array.clean(usersIdArray);
			usersIdArray = Ext.Array.unique(usersIdArray);

			var params = {};
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.USERS] = usersIdArray.join();

			CMDBuild.proxy.administration.userAndGroup.group.tabs.Users.update({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.gridAvailable.setLoading(true);

					this.cmfg('userAndGroupGroupTabUsersGridSelectedStoreLoad', {
						scope: this,
						callback: function (records, operation, success) {
							this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreLoad', {
								scope: this,
								callback: function (records, operation, success) {
									this.gridAvailable.setLoading(false);
								}
							});
						}
					});
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabUsersShow: function () {
			this.controllerGridAvailableToolbarPaging.cmfg('panelGridAndFormCommonToolbarPagingFilterBasicReset');

			this.userAndGroupGroupTabUsersGridAppliedAppliedFilterReset();

			// Store reset
			this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreGet').removeAll();
			this.userAndGroupGroupTabUsersGridSelectedStoreGet().removeAll();

			this.gridAvailable.setLoading(true);

			this.cmfg('userAndGroupGroupTabUsersGridSelectedStoreLoad', {
				scope: this,
				callback: function (records, operation, success) {
					this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreLoad', {
						scope: this,
						callback: function (records, operation, success) {
							this.gridAvailable.setLoading(false);
						}
					});
				}
			});
		},

		// AppliedFilter on appliedGrid property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			userAndGroupGroupTabUsersGridAppliedAppliedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
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
			userAndGroupGroupTabUsersGridAppliedAppliedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
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
			userAndGroupGroupTabUsersGridAppliedAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			userAndGroupGroupTabUsersGridAppliedAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.field.filter.basic.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.field.filter.basic.Filter} parameters.filter
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersGridAvailableFilterApply: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(parameters.filter) || Ext.Object.isEmpty(parameters.filter))
					return _error('userAndGroupGroupTabUsersGridAvailableFilterApply(): unmanaged filter parameter', this, parameters.filter);
			// END: Error handling

			this.userAndGroupGroupTabUsersGridAppliedAppliedFilterSet({ value: parameters.filter });

			this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreLoad');
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.disableStoreLoad
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersGridAvailableFilterClear: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

			this.userAndGroupGroupTabUsersGridAppliedAppliedFilterReset();

			if (!parameters.disableStoreLoad)
				this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreLoad');
		},

		/**
		 * @returns {Ext.data.Store}
		 */
		userAndGroupGroupTabUsersGridAvailableStoreGet: function () {
			return this.gridAvailable.getStore();
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Number} parameters.page
		 * @param {Object} parameters.params
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersGridAvailableStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('userAndGroupGroupTabUsersGridAvailableStoreLoad(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			// Remove users that are already in gridSelected store
			var selectedUsersIds = [];

			this.userAndGroupGroupTabUsersGridSelectedStoreGet().each(function (record) {
				if (Ext.isObject(record) && !Ext.Object.isEmpty(record))
					selectedUsersIds.push(record.get(CMDBuild.core.constants.Proxy.ID));
			}, this)

			selectedUsersIds = Ext.Array.unique(Ext.Array.clean(selectedUsersIds));

			var params = parameters.params;
			params[CMDBuild.core.constants.Proxy.ALREADY_ASSOCIATED] = false;
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			if (Ext.isArray(selectedUsersIds) && !Ext.isEmpty(selectedUsersIds))
				params[CMDBuild.core.constants.Proxy.EXCLUDE] = Ext.encode(selectedUsersIds);

			if (!this.userAndGroupGroupTabUsersGridAppliedAppliedFilterIsEmpty(CMDBuild.core.constants.Proxy.CONFIGURATION))
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.userAndGroupGroupTabUsersGridAppliedAppliedFilterGet(CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreGet').getProxy().extraParams = params; // Setup extraParams to work also with column header click

			this.cmfg('userAndGroupGroupTabUsersGridAvailableStoreGet').loadPage(parameters.page, {
				params: params,
				scope: parameters.scope,
				callback: parameters.callback
			});
		},

		/**
		 * @returns {Ext.data.Store}
		 */
		userAndGroupGroupTabUsersGridSelectedStoreGet: function () {
			return this.gridSelected.getStore();
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.params
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		userAndGroupGroupTabUsersGridSelectedStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			// Error handling
				if (this.cmfg('userAndGroupGroupSelectedGroupIsEmpty'))
					return _error('userAndGroupGroupTabUsersGridSelectedStoreLoad(): empty selectedGroup property', this, this.cmfg('userAndGroupGroupSelectedGroupGet'));
			// END: Error handling

			var params = parameters.params;
			params[CMDBuild.core.constants.Proxy.ALREADY_ASSOCIATED] = true;
			params[CMDBuild.core.constants.Proxy.ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			this.userAndGroupGroupTabUsersGridSelectedStoreGet().load({
				params: params,
				scope: parameters.scope,
				callback: parameters.callback
			});
		}
	});

})();
