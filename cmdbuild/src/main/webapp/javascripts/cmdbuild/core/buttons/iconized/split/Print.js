(function () {

	Ext.define('CMDBuild.core.buttons.iconized.split.Print', {
		extend: 'Ext.button.Split',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		delegateEventPrefix: 'onButton',

		/**
		 * @cfg {String}
		 *
		 * @legacy
		 */
		mode: undefined,

		/**
		 * Managed formats
		 *
		 * @cfg {Array}
		 * */
		formatList: [
			CMDBuild.core.constants.Proxy.CSV,
			CMDBuild.core.constants.Proxy.ODT,
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.RTF
		],

		iconCls: 'print',
		text: CMDBuild.Translation.print,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				menu: Ext.create('Ext.menu.Menu'),

				handler: function (button, e) {
					if (!button.isDisabled())
						button.showMenu();
				}
			});

			this.callParent(arguments);

			/** @legacy */
			switch (this.mode) {
				case 'legacy':
					return this.buildLegacyMenu();

				default:
					return this.buildMenu();
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 * @private
		 */
		buildLegacyMenu: function () {
			Ext.Array.each(this.formatList, function (format, i, allFormats) {
				this.menu.add({
					text: CMDBuild.Translation.as + ' ' + format.toUpperCase(),
					iconCls: format,
					format: format,
					scope: this,

					handler: function (button, e) {
						this.fireEvent('click', button.format);
					}
				});
			}, this);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildMenu: function () {
			Ext.Array.each(this.formatList, function (format, i, allFormats) {
				this.menu.add({
					text: CMDBuild.Translation.as + ' ' + format.toUpperCase(),
					iconCls: format,
					format: format,
					scope: this,

					handler: function (button, e) {
						this.delegate.cmfg(this.delegateEventPrefix + 'PrintButtonClick', button.format);
					}
				});
			}, this);
		}
	});

})();
