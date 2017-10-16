(function () {
	var EXTERNAL_LAYERS_FOLDER_NAME = "cm_external_layers_folder";
	var CMDBUILD_LAYERS_FOLDER_NAME = "cm_cmdbuild_layers_folder";
	var GEOSERVER_LAYERS_FOLDER_NAME = "cm_geoserver_layers_folder";
	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.gis.Layer', {
		extend: 'Ext.data.TreeModel',

		fields: [{
			name: "folderName", type: "string"
		}, {
			name: "text", type: "string"
		}]
	});

})();
