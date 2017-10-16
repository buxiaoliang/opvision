(function () {

	Ext.define('CMDBuild.core.buttons.iconized.split.add.Add', {
		extend: 'Ext.button.Split',

		/**
		 * @property {Ext.menu.Menu}
		 */
		menu: undefined,

		iconCls: 'add',
		text: CMDBuild.Translation.add,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.applyIf(this, {
				scope: this,
				menu: Ext.create('Ext.menu.Menu'),

				handler: function (button, e) {
					this.showMenu();
				}
			});

			this.callParent(arguments);
		}
	});

})();
