(function () {

	Ext.define('CMDBuild.controller.management.utility.changePassword.ChangePassword', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.utility.ChangePassword'
		],

		/**
		 * @cfg {CMDBuild.controller.management.utility.Utility}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onUtilityChangePasswordAbortButtonClick',
			'onUtilityChangePasswordSaveButtonClick'
		],

		/**
		 * @property {CMDBuild.view.management.utility.changePassword.FormPanel}
		 */
		form: undefined,

		/**
		 * @cfg {CMDBuild.view.management.utility.changePassword.ChangePasswordView}
		 */
		view: undefined,
		
		passwordExpired: false,
		helper: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.utility.Utility} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);
			
			this.view = Ext.create('CMDBuild.view.management.utility.changePassword.ChangePasswordView', { delegate: this,  passwordExpired: this.passwordExpired, helper: this.helper});

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 */
		onUtilityChangePasswordAbortButtonClick: function () {
			this.form.getForm().reset();
		},

		/**
		 * @returns {Void}
		 */
		onUtilityChangePasswordSaveButtonClick: function () {
			if (this.validate(this.form)) {
				CMDBuild.proxy.utility.ChangePassword.save({
					params: Ext.create('CMDBuild.model.utility.ChangePassword', this.form.getValues()).getDataLegacy(),
					scope: this,
					callback: function (options, success, response) {
						this.cmfg('onUtilityChangePasswordAbortButtonClick');
						
						
					},
					success: function (response, options, decodedResponse) {
						CMDBuild.core.Message.info(null, CMDBuild.Translation.passwordChanged);
						console.log(decodedResponse);
						if (this.passwordExpired) {
							setTimeout(function(){
								window.location = 'logout.jsp';								
							}, 1000);
						}
					}
				});
			}
				
		}
	});

})();
