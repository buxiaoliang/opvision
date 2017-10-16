(function () {

	/**
	 * @deprecated CMDBuild.view.common.panel.gridAndForm.tools.Restore
	 */
	Ext.define('CMDBuild.view.management.classes.tools.Restore', {
		extend: 'Ext.panel.Tool',

		tooltip: CMDBuild.Translation.restore,
		type: 'restore',

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
			_CMUIState.fullScreenOff();
		}
	});

})();
