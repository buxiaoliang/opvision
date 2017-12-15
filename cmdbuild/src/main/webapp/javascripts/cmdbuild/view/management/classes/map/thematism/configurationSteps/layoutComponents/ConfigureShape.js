(function() {
	Ext.define("CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureShape", {
		extend : "Ext.panel.Panel",

		parentWindow : undefined,
		interactionDocument : undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent : function() {
			var me = this;
			Ext.apply(this, {
				items : [ this.getRadioShape() ]
			});
			this.callParent(arguments);
		},
		defaults : {
			anchor : "100%"
		},
		getLayoutConfiguration : function() {
			return this.parentWindow.getLayoutConfiguration();
		},
		init : function() {
			var layoutConfiguration = this.getLayoutConfiguration();
			this.parentWindow.initForm(this, layoutConfiguration);
		},
		loadComponents : function(callback, callbackScope) {
		    CMDBuild.clearComponent(this);
			switch (this.parentWindow.getCurrentLayerType()) {
			case "POINT":
				this.add(this.getRadioShape());
				this.add(this.getMisures());
				break;
			case "POLYGON":
			case "LINESTRING":
				break;
			}
			this.init();
			callback.apply(callbackScope, []);
		},
		getMisures : function() {
			switch (this.parentWindow.getCurrentAnalysisType()) {
			case CMDBuild.gis.constants.layers.RANGES_ANALYSIS:
			case CMDBuild.gis.constants.layers.PUNTUAL_ANALYSIS:
				var rangeControl = Ext.create("Ext.form.field.Number", {
					fieldLabel : CMDBuild.Translation.radius,
					name : "firstValue",
					value : 10,
					allowDecimals : false,
					flex : 1
				});
				this.add(rangeControl);
				break;
			case CMDBuild.gis.constants.layers.GRADUATE_ANALYSIS:
				var minRangeControl = Ext.create("Ext.form.field.Number", {
					fieldLabel : CMDBuild.Translation.minRadius,
					name : "firstValue",
					value : 10,
					allowDecimals : false,
					flex : 1
				});
				this.add(minRangeControl);
				var maxRangeControl = Ext.create("Ext.form.field.Number", {
					fieldLabel : CMDBuild.Translation.maxRadius,
					name : "secondValue",
					allowDecimals : false,
					value : 20,
					flex : 1
				});
				this.add(maxRangeControl);
				break;
			}
		},
		getRadioShape : function() {
			var radio = Ext.create("Ext.form.RadioGroup", {
				fieldLabel : CMDBuild.Translation.management.modcard.gis.shape,
				vertical : true,
				border : true,
				items : [ {
					boxLabel : getShapeDescription(CMDBuild.gis.constants.shapes.CIRCLE),
					name : "shape",
					inputValue : CMDBuild.gis.constants.shapes.CIRCLE
				}, {
					boxLabel : getShapeDescription(CMDBuild.gis.constants.shapes.RECTANGLE),
					name : "shape",
					inputValue : CMDBuild.gis.constants.shapes.RECTANGLE,
					checked : true
				}, {
					boxLabel : getShapeDescription(CMDBuild.gis.constants.shapes.STAR),
					name : "shape",
					inputValue : CMDBuild.gis.constants.shapes.STAR
				} ]

			});
			return radio;
		}
	});
	function getShapeDescription(analysisType) {
		switch (analysisType) {
		case CMDBuild.gis.constants.shapes.CIRCLE:
			return CMDBuild.Translation.management.modcard.gis.shapes.circle;
		case CMDBuild.gis.constants.shapes.RECTANGLE:
			return CMDBuild.Translation.management.modcard.gis.shapes.rectangle;
		case CMDBuild.gis.constants.shapes.STAR:
			return CMDBuild.Translation.management.modcard.gis.shapes.star;
		}
		return CMDBuild.Translation.management.modcard.gis.shapes.circle;
	}

})();
