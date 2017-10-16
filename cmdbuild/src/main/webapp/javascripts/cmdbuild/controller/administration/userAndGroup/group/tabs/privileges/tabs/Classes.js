(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Classes', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes'
		],

		mixins: ['CMDBuild.controller.common.field.filter.advanced.Advanced'], // Import fieldConfiguration, filter, selectedClass property methods

		/**
		 * @cfg {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldFilterAdvancedConfigurationIsPanelEnabled',
			'fieldFilterAdvancedFilterGet',
			'fieldFilterAdvancedFilterIsEmpty',
			'fieldFilterAdvancedSelectedClassGet',
			'fieldFilterAdvancedSelectedClassIsEmpty',
			'onUserAndGroupGroupTabPrivilegesTabClassesFieldFilterAdvancedWindowgetEndpoint = onFieldFilterAdvancedWindowgetEndpoint',
			'onUserAndGroupGroupTabPrivilegesTabClassesRemoveFilterClick',
			'onUserAndGroupGroupTabPrivilegesTabClassesSetFilterClick',
			'onUserAndGroupGroupTabPrivilegesTabClassesSetPrivilege',
			'onUserAndGroupGroupTabPrivilegesTabClassesShow',
			'onUserAndGroupGroupTabPrivilegesTabClassesUIConfigurationButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.common.field.filter.advanced.window.Window}
		 */
		controllerFilterWindow: undefined,

		/**
		 * @property {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.UiConfiguration}
		 */
		controllerUiConfiguration: undefined,

		/**
		 * @property {CMDBuild.model.common.field.filter.advanced.FieldConfiguration}
		 *
		 * @private
		 */
		fieldConfiguration: undefined,

		/**
		 * @property {CMDBuild.model.common.field.filter.advanced.Filter}
		 *
		 * @private
		 */
		filter: undefined,

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.privileges.GridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.Privileges} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.privileges.tabs.Classes', { delegate: this });

			// Filter advanced window configuration
			this.fieldFilterAdvancedConfigurationSet({ enabledPanels: ['attribute', 'function', 'columnPrivileges'] });

			// Build sub controller
			this.controllerFilterWindow = Ext.create('CMDBuild.controller.common.field.filter.advanced.window.Window', {
				parentDelegate: this,
				configuration: {
					mode: 'grid',
					tabs: {
						attributes: {
							selectAtRuntimeCheckDisabled: true // BUSINNESS RULE: user couldn't create privilege's filter with runtime parameters
						}
					}
				}
			});
			this.controllerUiConfiguration = Ext.create('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.UiConfiguration', { parentDelegate: this });
		},

		/**
		 * @param {Object} resultObject
		 * @param {Object} resultObject.columnPrivileges
		 * @param {Object} resultObject.filter
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesFieldFilterAdvancedWindowgetEndpoint: function (resultObject) {
			if (Ext.encode(resultObject.filter).indexOf('"parameterType":"calculated"') < 0) {
				var params = {};
				params['privilegedObjectId'] = this.fieldFilterAdvancedSelectedClassGet(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

				if (
					Ext.isObject(resultObject) && !Ext.Object.isEmpty(resultObject)
					&& !Ext.isEmpty(resultObject.columnPrivileges)
				) {
					params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(resultObject.columnPrivileges);

					CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes.setRowAndColumn({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							CMDBuild.core.Message.info(
								CMDBuild.Translation.success,
								CMDBuild.Translation.columnPrivilegesSaved,
								false
							);

							this.cmfg('onUserAndGroupGroupTabPrivilegesTabClassesShow');
						}
					});
				} else if (
					Ext.isObject(resultObject) && !Ext.Object.isEmpty(resultObject)
					&& !Ext.isEmpty(resultObject.filter)
				) {
					params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(resultObject.filter);

					CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes.setRowAndColumn({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							CMDBuild.core.Message.info(
								CMDBuild.Translation.success,
								CMDBuild.Translation.rowPrivilegesSaved,
								false
							);

							this.cmfg('onUserAndGroupGroupTabPrivilegesTabClassesShow');
						}
					});
				}

			} else {
				CMDBuild.core.Message.error(
					CMDBuild.Translation.error,
					CMDBuild.Translation.warnings.itIsNotAllowedFilterWithCalculatedParams,
					false
				);
			}
		},

		/**
		 * @param {CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord} record
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesRemoveFilterClick: function (record) {
			Ext.Msg.show({
				title: CMDBuild.Translation.attention,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeFilter(record);
				}
			});
		},

		/**
		 * @param {CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord} record
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesSetFilterClick: function (record) {
			// Filter advanced window configuration
			this.filter = Ext.create('CMDBuild.model.common.field.filter.advanced.Filter', { // Manual set to avoid label setup
				configuration: Ext.decode(record.get(CMDBuild.core.constants.Proxy.FILTER) || '{}'),
				entryType: record.get(CMDBuild.core.constants.Proxy.NAME)
			});
			this.selectedClass = _CMCache.getEntryTypeByName(record.get(CMDBuild.core.constants.Proxy.NAME)); // Manual setup to avoid filter setup

			this.controllerFilterWindow.fieldFilterAdvancedWindowSelectedRecordSet({ value: record });
			this.controllerFilterWindow.show();
		},

		/**
		 * @param {Object} parameters
		 * @param {Number} parameters.rowIndex
		 * @param {String} parameters.privilege
		 *
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (attributes names)
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesSetPrivilege: function (parameters) {
			if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
				var params = {};
				params['privilege_mode'] = parameters.privilege;
				params['privilegedObjectId'] = this.view.store.getAt(parameters.rowIndex).get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onUserAndGroupGroupTabPrivilegesTabClassesShow');
					}
				});
			} else {
				_error('onUserAndGroupGroupTabPrivilegesTabClassesSetPrivilege(): unmanaged parameters', this, parameters);
			}
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesShow: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			this.view.getStore().load({ params: params });
		},

		/**
		 * @param {CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord} record
		 *
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabClassesUIConfigurationButtonClick: function (record) {
			this.controllerUiConfiguration.cmfg('userAndGroupGroupPrivilegesGridUIConfigurationRecordSet', record);
			this.controllerUiConfiguration.getView().show();
		},

		/**
		 * Send empty row and columns properties to reset values
		 *
		 * @param {CMDBuild.model.administration.userAndGroup.group.privileges.GridRecord} record
		 *
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (attributes names)
		 */
		removeFilter: function (record) {
			if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
				var params = {};
				params['privilegedObjectId'] = record.get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode([]);
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode({});
				params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

				// Set empty filter to clear value
				CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Classes.setRowAndColumn({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onUserAndGroupGroupTabPrivilegesTabClassesShow');
					}
				});
			} else {
				_error('removeFilter(): unmanaged record parameter', this, record);
			}
		}
	});

})();
