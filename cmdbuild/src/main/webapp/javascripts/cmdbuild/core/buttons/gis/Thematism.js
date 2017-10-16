(function() {

	Ext.define('CMDBuild.core.buttons.gis.Thematism', {
		extend : 'Ext.button.Split',
		iconCls : 'add',
		text : CMDBuild.Translation.thematismTitle,
		callback : undefined,
		interactionDocument : undefined,
		initComponent : function() {
			this.menu = this.getMenuItem();
			this.callParent(arguments);
		},

		add : function(values, current) {
			var me = this;
			for (var i = 0; i < values.length; i++) {
				this.menu.add([ {
					xtype : 'menucheckitem',
					text : values[i],
					group : 'layer',
					command : CMDBuild.gis.constants.thematic_commands.CHANGE_LAYER,
					checked : (values[i] === current)
				} ]);
			}
		},
		removeAll : function() {
			this.menu.removeAll();
			this.addEditControls();
		},
		/*
		 * 
		 * @param {Boolean} empty //no thematisms on this class
		 */
		getItem : function(command) {
			var items = this.menu.items;
			for (var i = 0; i < items.length; i++) {
				var item = items.items[i];
				if (command === item.command) {
					return item;
				}
			}
		},
		enableEntries : function(empty) {
			var itemEdit = this.getItem(CMDBuild.gis.constants.thematic_commands.MODIFY);
			var itemLegend = this.getItem(CMDBuild.gis.constants.thematic_commands.HIDE_LEGEND);
			if (!empty) {
				itemEdit.enable();
				itemLegend.enable();
			} else {
				itemEdit.disable();
				itemLegend.disable();
			}
		},
		addEditControls : function() {
			var mapPanel = this.interactionDocument.getMapPanel();
			this.menu.add([ {
				// xtype : 'text',
				text : CMDBuild.Translation.add,
				iconCls : 'add',
				command : CMDBuild.gis.constants.thematic_commands.NEW
			}, {
				// xtype : 'text',
				text : CMDBuild.Translation.edit,
				iconCls : 'modify',
				command : CMDBuild.gis.constants.thematic_commands.MODIFY
			}, {
				xtype : 'menucheckitem',
				text : CMDBuild.Translation.hideCurrent,
				command : CMDBuild.gis.constants.thematic_commands.HIDE_CURRENT
			}, {
				xtype : 'menucheckitem',
				text : CMDBuild.Translation.hideLegend,
				command : CMDBuild.gis.constants.thematic_commands.HIDE_LEGEND,
				checked : !mapPanel.getOpenLegend()
			} ]);
		},
		getMenuItem : function() {
			var me = this;

			return new Ext.menu.Menu({
				items : [],
				listeners : {
					click : function(menu, item, e, eOpts) {
						if (item.command) {
							me.callback(item.command, {
								text : item.text,
								checked : item.checked
							});
						}
						if (item.command === CMDBuild.gis.constants.thematic_commands.HIDE_LEGEND) {
							var mapPanel = me.interactionDocument.getMapPanel();
							mapPanel.setOpenLegend(!item.checked);
						}
					}
				}
			});

		}
	});

})();