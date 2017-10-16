(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.configuration.RelationGraph', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.BASE_LEVEL, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.CLUSTERING_THRESHOLD, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.DISPLAY_LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.EDGE_COLOR, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_EDGE_TOOLTIP, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_NODE_TOOLTIP, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.SPRITE_DIMENSION, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.STEP_RADIUS, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VIEW_POINT_DISTANCE, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.VIEW_POINT_HEIGHT, type: 'int', useNull: true }
		],

		/**
		 * @returns {Object}
		 */
		getParamsObject: function () {
			var data = this.getData();

			return {
				'baseLevel': data[CMDBuild.core.constants.Proxy.BASE_LEVEL],
				'clusteringThreshold': data[CMDBuild.core.constants.Proxy.CLUSTERING_THRESHOLD],
				'displayLabel': data[CMDBuild.core.constants.Proxy.DISPLAY_LABEL],
				'edgeColor': data[CMDBuild.core.constants.Proxy.EDGE_COLOR],
				'enabled': data[CMDBuild.core.constants.Proxy.ENABLED],
				'enableEdgeTooltip': data[CMDBuild.core.constants.Proxy.ENABLE_EDGE_TOOLTIP],
				'enableNodeTooltip': data[CMDBuild.core.constants.Proxy.ENABLE_NODE_TOOLTIP],
				'spriteDimension': data[CMDBuild.core.constants.Proxy.SPRITE_DIMENSION],
				'stepRadius': data[CMDBuild.core.constants.Proxy.STEP_RADIUS],
				'viewPointDistance': data[CMDBuild.core.constants.Proxy.VIEW_POINT_DISTANCE],
				'viewPointHeight': data[CMDBuild.core.constants.Proxy.VIEW_POINT_HEIGHT]
			};
		}
	});

})();
