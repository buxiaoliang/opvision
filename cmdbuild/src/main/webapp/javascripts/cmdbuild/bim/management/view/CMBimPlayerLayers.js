Ext.define("CMDBuild.bim.management.view.CMBimPlayerLayersDelegate", {
	/*
	 * @param {CMDBuild.bim.management.view.CMBimPlayerLayers} bimLayerPanel the
	 * layers panel that call the method @param {String} ifcLayerName the name
	 * of the layer for which the check is changed @param {Boolean} checked the
	 * current value of the check
	 */
	onLayerCheckDidChange : function(bimLayerPanel, ifcLayerName, checked) {
	}
});

Ext.define("CMDBuild.bim.management.view.CMBimPlayerLayers", {
	extend : "Ext.panel.Panel",
	
	layerGrid : undefined,
	
	initComponent : function() {
		var me = this;
		this.layerGrid = Ext.create("CMDBuild.bim.management.view.CMBimPlayerLayersGrid");
		this.items = [{
			xtype : "fieldset",
			title : CMDBuild.Translation.camera,
			padding : "0 5 5 5",
			layout : {
				type : 'hbox'
			},
			items : [ {
				xtype : "button",
				text : CMDBuild.Translation.common.button.showAll,
				flex : 1,
				handler : function() {
					var layerNames = [];
					me.layerGrid.getStore().each(function(record) {
						layerNames.push(record.get("description"));
						record.set("checked", true);
						record.commit();
					});
					me.delegate.onLayerCheckDidChange(me, layerNames, true);
				}
			}, {
				xtype : "button",
				text : CMDBuild.Translation.common.button.hideAll,
				flex : 1,
				handler : function() {
					var layerNames = [];
					me.layerGrid.getStore().each(function(record) {
						layerNames.push(record.get("description"));
						record.set("checked", false);
						record.commit();
					});
					me.delegate.onLayerCheckDidChange(me, layerNames, false);
				}
			} ]},
			this.layerGrid];
		this.layerGrid.parent = this;
		this.callParent(arguments);
	},
	loadLayers : function(data) {
		this.layerGrid.loadLayers(data);
	}
});
Ext.define("CMDBuild.bim.management.view.CMBimPlayerLayersGrid", {
	extend : "Ext.grid.Panel",

	initComponent : function() {
		this.store = Ext.create('Ext.data.Store', {
			fields : [ 'id', 'checked', 'description', "qt" ],
			data : []
		});

		var me = this;

		this.columns = [ {
			xtype : "checkcolumn",
			dataIndex : 'checked',
			fixed : true,
			// header: '&nbsp',
			// hideable: false,
			listeners : {
				scope : this,
				checkchange : function(column, rowIndex, checked) {
					var record = me.store.getAt(rowIndex);
					if (record) {
						me.parent.delegate.onLayerCheckDidChange(me, [record.get("description")], checked);
					}
				}
			},
			// menuDisabled: true,
			sortable : false,
			width : 30
		}, {
			flex : 1,
			text : 'Name',
			dataIndex : 'description'
		}, {
			text : 'Qt',
			fixed : true,
			width : 60,
			dataIndex : 'qt'
		} ];

		this.tools = [ {
			type : 'expand',
			tooltip : CMDBuild.Translation.common.tooltip.showAll,
			// hidden:true,
			handler : function(event, toolEl, panelHeader) {
			}
		}, {
			type : 'collapse',
			tooltip : CMDBuild.Translation.common.tooltip.hideAll,
			handler : function(event, toolEl, panelHeader) {
				var layerNames = [];
				me.getStore().each(function(record) {
					layerNames.push(record.get("description"));
					record.set("checked", false);
					record.commit();
				});
				me.parent.delegate.onLayerCheckDidChange(me, layerNames, false);
			}
		} ];
		this.callParent(arguments);
	},

	loadLayers : function(data) {
		this.store.loadData(data);
	},

	selectLayer : function(layerName) {
		var recordIndex = this.store.find("id", layerName);
		if (recordIndex >= 0) {
			var record = this.store.getAt(recordIndex);
			record.set("checked", true);
			record.commit();
		}
	}

});