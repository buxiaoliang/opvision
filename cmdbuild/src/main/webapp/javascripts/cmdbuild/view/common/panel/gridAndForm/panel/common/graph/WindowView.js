(function () {

	Ext.define('CMDBuild.view.common.panel.gridAndForm.panel.common.graph.WindowView', {
		extend: 'CMDBuild.core.window.AbstractCustomModal',

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		dimensionsMode: 'percentage',

		title: CMDBuild.Translation.relationGraph,

		listeners: {
			show: function (window, eOpts) {
				this.delegate.cmfg('onPanelGridAndFormGraphWindowShow');
			}
		}
	});

})();
