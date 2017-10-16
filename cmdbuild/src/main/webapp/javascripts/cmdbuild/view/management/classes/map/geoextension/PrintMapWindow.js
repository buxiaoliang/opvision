Ext.define("CMDBuild.view.management.classes.map.geoextension.PrintMapForm", {
	extend : 'Ext.form.Panel',
	xtype : 'contact-form',

	title : CMDBuild.Translation.print,
	frame : true,

	layouts : undefined,
	mainWindow : undefined,

	width : 400,
	layout : 'anchor',
	bodyCls : 'cmdb-blue-panel',
	border : false,
	bodyPadding : 10,
	fieldDefaults : {
		labelAlign : 'top',
		labelWidth : 100,
		labelStyle : 'font-weight:bold'
	},
	defaults : {
		anchor : '100%',
		margins : '0 0 10 0'
	},
	initComponent : function() {
		var me = this;
		this.layoutsStore = Ext.create("Ext.data.Store", {
			fields : [ "name", "type" ],
			data : []
		});
		this.comboLayouts = Ext.create("Ext.form.field.ComboBox", {
			xtype : 'combobox',
			fieldLabel :CMDBuild.Translation.layout,
			store : this.layoutsStore,
			labelAlign : 'top',
			height : 120,
			margin : '0',
			name : "layout",
			queryMode : "local",
			displayField : "name",
			valueField : "name",
			allowBlank : false,
			editable : false,
			triggerAction : "all",
			maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM

		});
		this.pageTitle = Ext.create("Ext.form.field.Text", {
			fieldLabel :CMDBuild.Translation.title,
			value : "CMDBuild Map"

		});
		this.comment = Ext.create("Ext.form.field.TextArea", {
			fieldLabel : CMDBuild.Translation.body,
			labelAlign : 'top',
			height : 120,
			margin : '0',
			value : "CMDBuild Map"

		});
		Ext.apply(this, {
			items : [ this.pageTitle, this.comboLayouts, this.comment ],
			buttons : [ {
				text : CMDBuild.Translation.cancel,
				listeners : {
					click : function() {
						me.mainWindow.hide();
					}
				}
			}, {
				text : CMDBuild.Translation.print,
				listeners : {
					click : function() {
						me.mainWindow.print()
						me.mainWindow.hide();
					}
				}
			} ]
		});
		this.callParent(arguments);
	},
	loadComponents : function() {
		this.comboLayouts.select(this.comboLayouts.getStore().getAt(0));
	}
});

Ext.define("CMDBuild.view.management.classes.map.geoextension.PrintMapWindow", {
	extend : "Ext.window.Window",
	layouts : undefined,
	/*
	 * @property {CMDBuild.view.management.classes.map.geoextension.CMDBuildGeoExt}
	 */
	printExecutor : undefined,
	listeners : {
		hide : function(panel, eOpts) {
		},
		show : function(panel, eOpts) {
			this.form.loadComponents();
		}
	},
	initComponent : function() {
		this.form = Ext.create("CMDBuild.view.management.classes.map.geoextension.PrintMapForm", {
			frame : false,
			border : false,
			region : "center",
			mainWindow : this
		});

		this.items = [ this.form ];
		this.loadLayouts();
		this.callParent(arguments);
	},
	loadLayouts : function() {
		var layoutsStore = Ext.create("Ext.data.Store", {
			fields : [ "name", "type" ],
			autoLoad : false,
			data : []
		});
		for (var i = 0; i < this.layouts.length; i++) {
			layoutsStore.add({
				"name" : this.layouts[i],
				"type" : this.layouts[i]
			});
		}
		this.form.layoutsStore.loadData(layoutsStore.getRange(), false);
	},
	print: function() {
		var pageTitle = this.form.pageTitle.getValue();
		var comment = this.form.comment.getValue();
		var layout = this.form.comboLayouts.getValue();
		this.printExecutor.printExecute({
			pageTitle : pageTitle,
			comment : comment,
			layout : layout
		});

	}
});
