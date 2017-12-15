(function () {

	Ext.define('CMDBuild.view.management.utility.changePassword.ChangePasswordView', {
		extend: 'Ext.panel.Panel',

		uses: [
	       'CMDBuild.core.constants.Proxy',
	       'CMDBuild.proxy.utility.ChangePassword'
		],

		/**
		 * @cfg {CMDBuild.controller.management.utility.changePassword.ChangePassword}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.management.utility.changePassword.FormPanel}
		 */
		form: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: false,
		frame: false,
		layout: 'fit',
		
		passwordExpired: false,
		helper: undefined,
		
		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			if (this.passwordExpired) { // from CHANGE PASSWORD page
				Ext.apply(this, {
					items: [
						this.form = Ext.create('CMDBuild.view.management.utility.changePassword.FormPanel', {
							title: CMDBuild.Translation.changePassword,
							border: true,
							delegate: this.delegate,
							helper: this.helper,
							frame: true,
							padding: 10 ,
							disableCancelButton: true,
							layout: {
								type: 'vbox',
								align: 'center'
							}
						})
					]
				});
				
			} else { // from UTILITY
				Ext.apply(this, {
					items: [
						this.form = Ext.create('CMDBuild.view.management.utility.changePassword.FormPanel', {delegate: this.delegate})
					]
				});
			}

			this.callParent(arguments);
		}
	});

})();
