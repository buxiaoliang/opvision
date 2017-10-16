(function () {

	Ext.define('CMDBuild.controller.administration.userAndGroup.group.tabs.privileges.tabs.DataView', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.DataView'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.group.privileges.Privileges}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUserAndGroupGroupTabPrivilegesTabDataViewSetPrivilege',
			'onUserAndGroupGroupTabPrivilegesTabDataViewShow'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.group.tabs.privileges.tabs.DataView}
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

			this.view = Ext.create('CMDBuild.view.administration.userAndGroup.group.tabs.privileges.tabs.DataView', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onUserAndGroupGroupTabPrivilegesTabDataViewShow: function () {
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
		onUserAndGroupGroupTabPrivilegesTabDataViewSetPrivilege: function (parameters) {
			if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
				var params = {};
				params['privilege_mode'] = parameters.privilege;
				params['privilegedObjectId'] = this.view.store.getAt(parameters.rowIndex).get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.GROUP_ID] = this.cmfg('userAndGroupGroupSelectedGroupGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.userAndGroup.group.tabs.privileges.DataView.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onUserAndGroupGroupTabPrivilegesTabDataViewShow');
					}
				});
			} else {
				_error('wrong or empty parameters in onUserAndGroupGroupTabPrivilegesTabDataViewSetPrivilege()', this);
			}
		}
	});

})();
