(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.classes.tabs.geoAttributes.Style', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.EXTERNAL_GRAPHIC, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.FILL_COLOR, type: 'string', defaultValue: '#000000' },
			{ name: CMDBuild.core.constants.Proxy.FILL_OPACITY, type: 'float', defaultValue: 1 },
			{ name: CMDBuild.core.constants.Proxy.POINT_RADIUS, type: 'int', defaultValue: 3 },
			{ name: CMDBuild.core.constants.Proxy.STROKE_COLOR, type: 'string', defaultValue: '#000000' },
			{ name: CMDBuild.core.constants.Proxy.STROKE_DASHSTYLE, type: 'string', defaultValue: 'solid' },
			{ name: CMDBuild.core.constants.Proxy.STROKE_OPACITY, type: 'float', defaultValue: 1 },
			{ name: CMDBuild.core.constants.Proxy.STROKE_WIDTH, type: 'int', defaultValue: 1 }
		]
	});

})();
