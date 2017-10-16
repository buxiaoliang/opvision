(function () {

	Ext.define('CMDBuild.core.buttons.text.Widget', {
		extend: 'CMDBuild.core.buttons.Base',

		/**
		 * @cfg {Object}
		 */
		widgetDefinition: {},

		margin: '0 3 3 3',
		width:'100%',
		textDefault: CMDBuild.Translation.widget,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		disable: function () {
			if (
				(this.widgetDefinition && this.widgetDefinition['alwaysenabled'])
				|| CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.PROCESS_WIDGET_ALWAYS_ENABLED) // FIXME: this configuration should be used only in processes
			) {
				return this.enable();
			}

			return this.callParent(arguments);
		}
	});

})();
