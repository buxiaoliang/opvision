(function() {
	// this object is wrong: the colorsTable must be a member here.
	Ext.define('CMDBuild.view.management.classes.map.thematism.ThematicColors', {
		getColor : function(value, colorsTable, analysisType, index) {
			var color = getColorFromTable(value, colorsTable);
			if (color) {
				return genericToRgba(color);
			}
			var isPuntual = (analysisType === CMDBuild.gis.constants.layers.PUNTUAL_ANALYSIS);
			var exa = (isPuntual) ? puntualColors[index%puntualColors.length] : rangeColors[index%rangeColors.length];
			return toRgba(exa);
		},
		tableToExa : function(colorsTable) {
			for (var i = 0; i < colorsTable.length; i++) {
				for (var j = 0; j < colorsTable[i].cards.length; j++) {
					colorsTable[i].color = genericToRgba(colorsTable[i].color);
				}
			}
			return colorsTable;
		}
	});
	function genericToRgba(color) {
		return (color.substr(0, 1) === "#") ? toRgba(color.substr(1)) : color;

	}
	function getColorFromTable(value, colorsTable) {
		for (var i = 0; colorsTable && i < colorsTable.length; i++) {
			if (colorsTable[i].value === value || parseInt(colorsTable[i].value) === parseInt(value)) {
				return colorsTable[i].color;
			}
		}
		return null;
	}
	function toRgba(exa) {
		var r = parseInt(exa.substr(0, 2), 16);
		var g = parseInt(exa.substr(2, 2), 16);
		var b = parseInt(exa.substr(4, 2), 16);
		return "rgba(" + r + ", " + g + "," + b + "," + .7 + ")";
	}
	var puntualColors = [ 'FFFF00', '00FF00', '00FFFF', '0000FF', 'FF0000', 'FF00FF', 'FF6666', '6666FF', 'FF6600', '66FF66',
	          			'D0E0E3', 'CFE2F3', 'D9D2E9', 'EAD1DC', 'EA9999', 'F9CB9C', 'FFE599', 'B6D7A8', 'FCE5CD', '9FC5E8',
	          			'B4A7D6', 'D5A6BD', 'E06666', 'F6B26B', 'FFD966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'FFF2CC',
	          			'CC0000', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A64D79', '990000', 'B45F06',
	          			'BF9000', '38761D', '134F5C', '0B5394', '351C75', '741B47', '660000', '783F04', '7F6000', '000000',
	          			'444444', '666666', '999999', 'CCCCCC', 'EEEEEE', 'F3F3F3', 'FFFFFF', '33FF33', 'FF9900', '274E13',
	          			'0C343D', '073763', '20124D', '4C1130' ];
	var rangeColors = ['9999FF', '0000FF', '0000AA', '00AA00', '00FF00',   '99FF99',  'FF9999', 'FF9900', 'AA0000', 'FF0000'];

})();