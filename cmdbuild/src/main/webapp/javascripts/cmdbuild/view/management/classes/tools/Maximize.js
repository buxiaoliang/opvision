(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.tools.Maximize
	 */
	Ext.define('CMDBuild.view.management.classes.tools.Maximize', {
		extend: 'Ext.panel.Tool',

		tooltip: CMDBuild.Translation.maximizeGrid,
		type: 'maximize',

		/**
		 * @param {Ext.EventObject} event
		 * @param {Ext.Element} target
		 * @param {Ext.panel.Header} owner
		 * @param {Ext.panel.Tool} tool
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		handler: function (event, target, owner, tool) {
			_CMUIState.onlyGrid();
		}
	});

})();
