(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.Filter', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Filter'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.group.privileges.Privileges}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabPrivilegesTabFilterSetPrivilege',
			'onUserAndGroupGroupTabPrivilegesTabFilterShow'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.privileges.tabs.Filter}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.group.privileges.Privileges} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.privileges.tabs.Filter', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabFilterShow: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

			this.view.getStore().load({ params: params });
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
		onUserAndGroupGroupTabPrivilegesTabFilterSetPrivilege: function (parameters) {
			if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
				var params = {};
				params['privilege_mode'] = parameters.privilege;
				params['privilegedObjectId'] = this.view.store.getAt(parameters.rowIndex).get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.Filter.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onUserAndGroupGroupTabPrivilegesTabFilterShow');
					}
				});
			} else {
				_error('wrong or empty parameters in onUserAndGroupGroupTabPrivilegesTabFilterSetPrivilege()', this);
			}
		}
	});

})();
