(function () {

	Ext.define('CMDBuild.core.buttons.iconized.split.add.Workflow', {
		extend: 'Ext.button.Split',

		/**
		 * @property {Ext.menu.Menu}
		 */
		menu: undefined,

		iconCls: 'add',
		text: CMDBuild.Translation.start,

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
					button.showMenu();
				}
			});

			this.callParent(arguments);
		},

		/**
		 * Enable only if is not superclass or if is superclass not empty
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		enable: function () {
			if (this.isEnableActionEnabled())
				this.callParent(arguments);
		},

		/**
		 * Default implementation
		 *
		 * @returns {Boolean}
		 *
		 * @abstract
		 */
		isEnableActionEnabled: function () {
			return true;
		}
	});

})();
