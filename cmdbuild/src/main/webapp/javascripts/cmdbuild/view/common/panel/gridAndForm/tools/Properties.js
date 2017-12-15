(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.tools.Properties', {
		extend: 'CMDBuild.view.common.panel.gridAndForm.tools.Menu',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.GridAndForm}
		 */
		delegate: undefined,

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
