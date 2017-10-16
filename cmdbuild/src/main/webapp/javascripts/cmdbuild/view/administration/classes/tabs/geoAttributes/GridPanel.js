(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.geoAttributes.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.GeoAttributes'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.GeoAttributes}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-border-bottom',
		frame: false,
		split: true,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.TYPE,
						text: CMDBuild.Translation.type,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.NAME,
						text: CMDBuild.Translation.name,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						flex: 1
					}
				],
				store: CMDBuild.proxy.administration.classes.tabs.GeoAttributes.getStore()
			});

			this.callParent(arguments);
		},

		listeners: {
			itemdblclick: function (grid, record, item, index, e, eOpts) {
				this.delegate.cmfg('onClassesTabGeoAttributesItemDoubleClick');
			},
			select: function (row, record, index) {
				this.delegate.cmfg('onClassesTabGeoAttributesRowSelected');
			}
		}
	});

})();
