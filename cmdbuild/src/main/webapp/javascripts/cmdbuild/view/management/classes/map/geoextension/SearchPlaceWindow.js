Ext.define("CMDBuild.view.management.classes.map.geoextension.SearchPlaceForm", {
	extend : 'Ext.form.Panel',
	xtype : 'contact-form',

	title : CMDBuild.Translation.find,
	frame : true,

	places : undefined,
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
		this.placesStore = Ext.create("Ext.data.Store", {
			fields : [ "name", "lon", "lat" ],
			data : []
		});
		this.comboPlaces = Ext.create("Ext.grid.Panel", {
			store : this.placesStore,
			height : 400,
			columns : [ {
				text : CMDBuild.Translation.descriptionLabel,
				flex : 1,
				sortable : true,
				dataIndex : 'name'
			}, {
				text : CMDBuild.Translation.longitudeAbbr,
				width : 75,
				sortable : true,
				dataIndex : 'lon'
			}, {
				text : CMDBuild.Translation.latitudeAbbr,
				width : 80,
				sortable : true,
				renderer : this.changeRenderer,
				dataIndex : 'lat'
			} ],
			listeners : {
				beforeitemdblclick : function(control, row) {
					var lat = row.get("lat");
					var lon = row.get("lon");
					lat = parseInt(lat * 10000) / 10000.0;
					lon = parseInt(lon * 10000) / 10000.0;
					var center = ol.proj.transform([ lon, lat ], 'EPSG:4326', 'EPSG:3857');
					var mapPanel = me.mainWindow.interactionDocument.getMapPanel();
					mapPanel.view.setCenter(center);
					mapPanel.map.renderSync();
					mapPanel.view.setZoom(18);
				}
			}
		});
		this.place = Ext.create("Ext.form.field.Text", {
			fieldLabel : CMDBuild.Translation.descriptionLabel,
			value : "",
			listeners : {
				scope: this,
				specialkey: function (field, e, eOpts) {
					if (e.getKey() == e.ENTER)
						me.search(field.value);
				},
				blur : function(field, e, eOpts) {
					me.search(field.value);
				}
			}

		});
		Ext.apply(this, {
			items : [ this.place, this.comboPlaces ],
			buttons : [ {
				text : CMDBuild.Translation.close,
				listeners : {
					click : function() {
						me.mainWindow.hide();
					}
				}
			} ]
		});
		this.callParent(arguments);
	},
	search : function(address) {
		var NOMINATIM_SERVER = CMDBuild.gis.constants.search_place.NOMINATIM_SERVER;
		var address_searchUrl = NOMINATIM_SERVER + address;
		var me = this;
		Ext.Ajax.request({
			url : address_searchUrl,
			method : "GET",
			success : function(response) {
				me.places = Ext.decode(response.responseText)
				me.loadPlaces();
			}
		});
	},
	loadPlaces : function() {
		var placesStore = Ext.create("Ext.data.Store", {
			fields : [ "name", "lon", "lat" ],
			autoLoad : false,
			data : []
		});
		for (var i = 0; i < this.places.length; i++) {
			placesStore.add({
				"name" : this.places[i].display_name,
				"lon" : this.places[i].lon,
				"lat" : this.places[i].lat
			});
		}
		this.placesStore.loadData(placesStore.getRange(), false);
	}
});

Ext.define("CMDBuild.view.management.classes.map.geoextension.SearchPlaceWindow", {
	extend : "Ext.window.Window",
	interactionDocument : undefined,
	initComponent : function() {
		this.form = Ext.create("CMDBuild.view.management.classes.map.geoextension.SearchPlaceForm", {
			frame : false,
			border : false,
			region : "center",
			mainWindow : this
		});

		this.items = [ this.form ];
		this.callParent(arguments);
	}
});
