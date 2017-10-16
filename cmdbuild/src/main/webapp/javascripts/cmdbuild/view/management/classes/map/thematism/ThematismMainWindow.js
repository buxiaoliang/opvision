(function() {
	Ext.define("CMDBuild.view.management.classes.map.thematism.ThematismMainWindow", {
		extend : "CMDBuild.core.window.AbstractCustomModal",

		/**
		 * @cfg {CMDBuild.controller.management.classes.map.thematism.ThematismMainWindow}
		 */
		delegate : undefined,

		/**
		 * @cfg {String}
		 */
		baseTitle : CMDBuild.Translation.searchFilter,

		/**
		 * @cfg {String}
		 */
		dimensionsMode : "percentage",

		/**
		 * @property {Ext.tab.Panel}
		 */
		wrapper : undefined,

		border : true,
		closeAction : "hide",
		frame : true,
		bodyCls: 'cmdb-blue-panel',
		layout: "fit",

		thematismConfiguration : undefined,
		functionConfiguration : undefined,
		layoutConfiguration : undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent : function() {
			this.configureThematism = Ext.create(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureThematism", {
						interactionDocument : this.interactionDocument,
						parentWindow : this
					});
			this.configureSourceFunction = Ext.create(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureSourceFunction", {
						interactionDocument : this.interactionDocument,
						parentWindow : this
					});
			this.configureFieldFunction = Ext.create(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureFieldFunction", {
						interactionDocument : this.interactionDocument,
						parentWindow : this
					});
			this.configureLayout = Ext.create(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureLayout", {
						interactionDocument : this.interactionDocument,
						parentWindow : this
					});
			this.wizard = this.getWizard();
			Ext.apply(this, {
				items : [ this.wizard ]
			});
			this.callParent(arguments);
		},

		listeners : {
			hide : function(panel, eOpts) {
			},
			show : function(panel, eOpts) {
				this.configureThematism.loadComponents(function() {
					this.wizard.getLayout().setActiveItem("configureThematism");
				}, this);
			}
		},
		getWizard : function() {
			var wizard = Ext.widget("panel", {
				title : "",
				border : false,
				itemId : "wizard",
				width : "100%",
				height : "100%",
				bodyCls: 'cmdb-blue-panel',
				layout : "card",
				defaults : {
					border : false,
					bodyPadding : 20
				},
				items : [ this.configureThematism, this.configureSourceFunction, this.configureFieldFunction,
						this.configureLayout ]

			});
			return wizard;
		},
		configure : function(configuration) {
			this.layoutConfiguration = clone(configuration.layoutConfiguration);
			this.functionConfiguration = clone(configuration.functionConfiguration);
			this.thematismConfiguration = clone(configuration.thematismConfiguration);
		},
		getCurrentAttribute : function() {
			return this.functionConfiguration.attribute;
		},
		getCurrentStrategy : function() {
			return this.interactionDocument.getStrategyByDescription(this.functionConfiguration.currentStrategy);
		},
		getCurrentSourceType : function() {
			return this.thematismConfiguration.source;
		},
		getCurrentLayer : function() {
			return this.thematismConfiguration.sourceLayer;
		},
		getCurrentLayout : function() {
			return this.thematismConfiguration.sourceLayer;
		},
		getCurrentAnalysisType : function() {
			return this.thematismConfiguration.analysis;
		},
		getThematismConfiguration : function() {
			return this.thematismConfiguration;
		},
		getFunctionConfiguration : function() {
			return this.functionConfiguration;
		},
		getLayoutConfiguration : function() {
			return this.layoutConfiguration;
		},
		getAnalysisDescription : function(analysisType) {
			switch (analysisType) {
			case CMDBuild.gis.constants.layers.RANGES_ANALYSIS:
				return CMDBuild.Translation.thematismRanges;
			case CMDBuild.gis.constants.layers.PUNTUAL_ANALYSIS:
				return CMDBuild.Translation.thematismPuntual;
			case CMDBuild.gis.constants.layers.GRADUATE_ANALYSIS:
				return CMDBuild.Translation.thematismGraduate;
			}
			return CMDBuild.Translation.thematismPuntual;
		},
		getSourceDescription : function(sourceType) {
			switch (sourceType) {
			case CMDBuild.gis.constants.layers.TABLE_SOURCE:
				return CMDBuild.Translation.thematicTable;
			case CMDBuild.gis.constants.layers.FUNCTION_SOURCE:
				return CMDBuild.Translation.thematicFunction;
			}
			return CMDBuild.Translation.thematicTable;
		},
		getCurrentLayerType : function() {
			var layer = this.interactionDocument.getGeoLayerByName(this.getCurrentLayer());
			var type = undefined;
			if (layer) {
				type = layer.get("adapter").getAttributeType();
			}
			return type;
		},
		getLayerName : function() {
			return this.thematismConfiguration.layerName;
		},
		close : function() {
			this.hide();
		},
		advanceConfigurationLayouts : function() {
			CMDBuild.core.LoadMask.show();

			this.configureLayout.loadComponents(function() {
				CMDBuild.core.LoadMask.hide();
				this.wizard.getLayout().setActiveItem("configureLayout");

			}, this);
		},
		advance : function(step, configurationObject) {
			switch (step) {
			case "configureThematism":
				this.thematismConfiguration = configurationObject;
				if (this.thematismConfiguration.source === CMDBuild.gis.constants.layers.FUNCTION_SOURCE) {
					this.configureSourceFunction.loadComponents(function() {
						this.wizard.getLayout().setActiveItem("configureSourceFunction");

					}, this);
				} else {
					this.configureFieldFunction.loadComponents(function() {
						this.wizard.getLayout().setActiveItem("configureFieldFunction");

					}, this);

				}
				break;
			case "configureFieldFunction":
			case "configureSourceFunction":
				this.functionConfiguration = configurationObject;
				this.advanceConfigurationLayouts();
				break;
			}
		},
		previous : function(step) {
			switch (step) {
			case "configureSourceFunction":
			case "configureFieldFunction":
				this.wizard.getLayout().setActiveItem("configureThematism");
				break;
			case "configureLayout":
				if (this.thematismConfiguration.source === CMDBuild.gis.constants.layers.FUNCTION_SOURCE) {
					this.wizard.getLayout().setActiveItem("configureSourceFunction");
				} else {
					this.wizard.getLayout().setActiveItem("configureFieldFunction");
				}
				break;
			}
		},
		showOnMap : function(configurationObject) {
			this.layoutConfiguration = configurationObject;
			var currentCard = this.interactionDocument.getCurrentCard();
			var currentClassName =  currentCard.className;
			this.delegate.cmfg('onShowThematism', {
				name : this.getLayerName(),
				layer : this.interactionDocument.getGeoLayerByName(this.getCurrentLayer()),
				strategy : this.getCurrentStrategy(),
				configuration : {
					originalLayer : {
						className :currentClassName,
						name:this.thematismConfiguration.sourceLayer
					},
					thematismConfiguration : clone(this.thematismConfiguration),
					functionConfiguration : clone(this.functionConfiguration),
					layoutConfiguration : clone(this.layoutConfiguration)

				}
			});
			this.hide();

		},
		initForm : function(form, values) {
			if (!values) {
				return;
			}
			form.items.each(function(item) {
				var component = form.child("[name='" + item.name + "']");
				if (item.xtype === "radiogroup") {
					var val = {};
					val[item.name] = values[item.name];
					component.setValue(val);
				} else if (component.setValue) {
					component.setValue(values[item.name]);
				}

			});

		}

	});
	function clone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
})();
