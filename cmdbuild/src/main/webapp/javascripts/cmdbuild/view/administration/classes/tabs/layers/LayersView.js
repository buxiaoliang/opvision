(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.layers.LayersView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.Layers}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.layers.GridPanel}
		 */
		grid: undefined,

		border: false,
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.layers,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.classes.tabs.layers.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onClassesTabLayersShow');
			}
		}
	});

})();
