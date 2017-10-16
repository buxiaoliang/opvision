(function() {
	var WMS_IMAGE_FORMAT = 'image/png';
	var GEOSERVER_SERVICE_TYPE = "wms";
	var DEFAULT_MIN_ZOOM = 0;
	var DEFAULT_MAX_ZOOM = 25;

	Ext.define('CMDBuild.view.management.classes.map.geoextension.Layer', {

		/**
		 * @param {Object}
		 *            geoAttribute
		 * @param {String}
		 *            geoAttribute.type
		 * @param {String}
		 *            geoAttribute.name
		 * @param {String}
		 *            geoAttribute.description
		 * @param {String}
		 *            geoAttribute.masterTableName // class name
		 * @param {String}
		 *            geoAttribute.externalGraphic //icon url
		 * 
		 */
		constructor : function(geoAttribute, withEditWindow, interactionDocument) {
			this.interactionDocument = interactionDocument;
			this.layer = buildGeoserverLayer(geoAttribute);
			this.layer.set("name", geoAttribute.name);
			this.callParent(arguments);
		},
		getLayer : function() {
			return this.layer;
		},
		getSource : function() {
			return this.layer.getSource();
		}
	});

	/**
	 * @param {Object}
	 *            geoAttribute
	 * @param {String}
	 *            geoAttribute.type
	 * @param {String}
	 *            geoAttribute.name
	 * @param {String}
	 *            geoAttribute.description
	 * @param {String}
	 *            geoAttribute.masterTableName // class name
	 * @param {String}
	 *            geoAttribute.externalGraphic //icon url
	 * 
	 */
	function buildGeoserverLayer(geoAttribute) {
		var geoserver_ws = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'workspace' ]);
		var geoserver_url = CMDBuild.configuration.gis.get([ CMDBuild.core.constants.Proxy.GEO_SERVER, 'url' ]);
		var source = new ol.source.TileWMS({
			url : geoserver_url + "/" + GEOSERVER_SERVICE_TYPE,
			strategy : ol.loadingstrategy.bbox,
			params : {
				layers : geoserver_ws + ":" + geoAttribute.name,
				format : WMS_IMAGE_FORMAT,
				transparent : true,
				SRS : 'EPSG:3857'

			}
		});

		var layer = new ol.layer.Tile({
			title : geoAttribute.description,
			source : source
		});
		layer.cmdb_minZoom = geoAttribute.minZoom || DEFAULT_MIN_ZOOM;
		layer.cmdb_maxZoom = geoAttribute.maxZoom || DEFAULT_MAX_ZOOM;
		layer.geoAttribute = geoAttribute;
		layer.editLayer = undefined;
		layer.cmdb_index = geoAttribute.cmdb_index;
		layer.set("name", geoAttribute.name);
		layer.set("geoAttribute", geoAttribute);

		return layer;
	}

})();
