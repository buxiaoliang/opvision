(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.tools.Minimize', {
		extend: 'Ext.panel.Tool',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.GridAndForm}
		 */
		delegate: undefined,

		tooltip: CMDBuild.Translation.minimizeGrid,
		type: 'minimize',

		/**
		 * @param {Ext.EventObject} event
		 * @param {Ext.Element} target
		 * @param {Ext.panel.Header} owner
		 * @param {Ext.panel.Tool} tool
		 *
		 * @returns {Void}
		 */
		handler: function (event, target, owner, tool) {
			this.delegate.cmfg('panelGridAndFormMixinsExpansionModeSet', {
				force: true,
				maximize: 'bottom'
			});
		}
	});

})();
