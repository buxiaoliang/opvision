Ext.define('CMDBuild.view.changePassword.MainViewport', {
	extend : 'Ext.container.Viewport',
	
	uses : [ 'CMDBuild.view.management.utility.changePassword.ChangePasswordView' ],
	
	/**
	 * @cfg {CMDBuild.controller.management.utility.changePassword.changePassword}
	 */
	delegate : undefined,

	border : false,
	frame : true,
	layout : 'border',
	helper: undefined,
	
	
	initComponent: function(){
		var _controller = Ext.create('CMDBuild.controller.management.utility.changePassword.ChangePassword', {delegate: this.delegate, passwordExpired: true, helper: this.helper});
		Ext.apply(this, {
			items: [
				 {
					xtype : 'panel',
					region : 'north',
					contentEl : 'header',
					border : true,
					frame : false,
					height : 45
				}, 
				Ext.create('Ext.panel.Panel', {
					bodyCls: 'cmdb-blue-panel-no-padding',
					region: 'center',
					border: false,
					frame: false,
					layout: 'card',
					padding: '5 5 5 0',
					items : [_controller.view]
				}),
				{
					xtype: 'panel',
					region: 'south',
					contentEl: 'footer',
					border: true,
					frame: false,
					height: 18
				}]
			
		});
		
		this.callParent(arguments);
		
	}

});