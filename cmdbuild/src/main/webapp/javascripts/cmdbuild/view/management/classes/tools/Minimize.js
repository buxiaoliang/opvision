(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.tools.Minimize
	 */
	Ext.define('CMDBuild.view.management.classes.tools.Minimize', {
		extend: 'Ext.panel.Tool',

		tooltip: CMDBuild.Translation.minimizeGrid,
		type: 'minimize',

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
			_CMUIState.onlyForm();
		}
	});

})();
