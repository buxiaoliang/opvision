(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.common.panel.gridAndForm.GridAndFormView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.GridAndForm}
		 */
		delegate: undefined,

		/**
		 * @cfg {Boolean}
		 */
		enableTools: true,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: true,
		frame: false,
		layout: 'border',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				tools: this.enableTools ? [
					Ext.create('CMDBuild.view.common.panel.gridAndForm.tools.Properties', { delegate: this.delegate }),
					Ext.create('CMDBuild.view.common.panel.gridAndForm.tools.Minimize', { delegate: this.delegate }),
					Ext.create('CMDBuild.view.common.panel.gridAndForm.tools.Maximize', { delegate: this.delegate }),
					Ext.create('CMDBuild.view.common.panel.gridAndForm.tools.Restore', { delegate: this.delegate })
				] : []
			});

			this.callParent(arguments);
		}
	});

})();
