(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.tools.Properties
	 */
	Ext.define('CMDBuild.view.management.dataView.tools.Properties', {
		extend: 'CMDBuild.view.management.dataView.tools.Menu',

		tooltip: CMDBuild.Translation.properties,
		type: 'properties',

		style: { // Emulation of spacer
			margin: '0 5px 0 0'
		},
		
		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				menu: Ext.create('Ext.menu.Menu',{
					items: [
						CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyItemConfigurationGet')
					]
				})
			});
			
			this.callParent(arguments);
		}

	});

})();
