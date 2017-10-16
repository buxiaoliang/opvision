(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.layers.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.Layers'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.Layers}
		 */
		delegate: undefined,

		border: false,
		frame: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.domainDescription,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME,
						text: CMDBuild.Translation.referenceClass,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.TYPE,
						text: CMDBuild.Translation.type,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.MIN_ZOOM,
						text: CMDBuild.Translation.maximumZoom,
						flex: 1
					},
					{
						dataIndex: CMDBuild.core.constants.Proxy.MAX_ZOOM,
						text: CMDBuild.Translation.minimumZoom,
						flex: 1
					},
					Ext.create('Ext.grid.column.CheckColumn', {
						dataIndex: CMDBuild.core.constants.Proxy.IS_VISIBLE,
						text: CMDBuild.Translation.visibility,
						width: 60,
						align: 'center',
						hideable: false,
						menuDisabled: true,
						fixed: true,
						scope: this,

						listeners: {
							scope: this,
							checkchange: function (column, rowIndex, checked, eOpts) {
								this.delegate.cmfg('onClassesTabLayersVisibilityChange', {
									checked: checked,
									record: this.getStore().getAt(rowIndex)
								});
							}
						}
					})
				],
				store: CMDBuild.proxy.administration.classes.tabs.Layers.getStore()
			});

			this.callParent(arguments);

			this.getStore().on('load', function (store, records, successful, eOpts) {
				this.delegate.cmfg('onClassesTabLayersStoreLoad');
			}, this);
		}
	});

})();
