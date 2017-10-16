(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.geoAttributes.GeoAttributesView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.GeoAttributes}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.geoAttributes.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.geoAttributes.GridPanel}
		 */
		grid: undefined,

		border: false,
		frame: false,
		layout: 'border',
		title: CMDBuild.Translation.geographicalAttributes,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addAttribute,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabGeoAttributesAddButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.classes.tabs.geoAttributes.GridPanel', {
						delegate: this.delegate,
						region: 'north',
						height: '30%'
					}),
					this.form = Ext.create('CMDBuild.view.administration.classes.tabs.geoAttributes.FormPanel', {
						delegate: this.delegate,
						region: 'center'
					})
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onClassesTabGeoAttributesShow');
			}
		}
	});

})();
