(function() {
	var DEFAULT_GRADE_COLOR = '0000FF';
	Ext.define("CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureSegments",
			{
				extend : "Ext.panel.Panel",
				itemId : "configureSegments",
				xtype : "form",
				layout : "anchor",
				bodyCls: 'cmdb-blue-panel',
				border: false,

				parentWindow : undefined,
				interactionDocument : undefined,
				gradeColor : DEFAULT_GRADE_COLOR,

				/**
				 * @returns {Void}
				 * 
				 * @override
				 */
				initComponent : function() {
					var me = this;
					var graduateControl = this.getGraduateControl();
					Ext.apply(this, {
						items : [ {
							xtype : "numberfield",
							fieldLabel : CMDBuild.Translation.thematicSegments,
							name : 'segmentsConfiguration',
							allowBlank : false,
							maxValue : 10,
							minValue : 1,
							maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM,
							listeners : {
								change : function(field, newValue, oldValue, eOpts) {
									var layoutConfiguration = me.getLayoutConfiguration();
									layoutConfiguration.segmentsConfiguration = newValue;
									me.parentWindow.refreshGridColors();
								}
							}

						}, this.getGraduateControl() ]
					});
					this.callParent(arguments);
				},
				defaults : {
					anchor : "100%"
				},
				getLayoutConfiguration : function() {
					return this.parentWindow.getLayoutConfiguration();
				},
				getPickerControl : function(color) {
					var customColors = [ 'fa7166', 'cf2424', 'a01a1a', '7e3838', 'ca7609', 'f88015', 'eda12a',
							'd5b816', 'e281ca', 'bf53a4', '9d3283', '7a0f60', '542382', '7742a9', '8763ca', 'b586e2',
							'7399f9', '4e79e6', '2951b9', '133897', '1a5173', '1a699c', '3694b7', '64b9d9', 'a8c67b',
							'83ad47', '2e8f0c', '176413', '0f4c30', '386651', '3ea987', '7bc3b5' ];

					var picker = Ext.create('Ext.picker.Color');

					picker.colors = customColors;
					var me = this;
					var colorPicker = Ext.create('Ext.Button', {
						menu : {
							xtype : 'colormenu',
							name : "gradeColor",
							picker : picker,
							value : DEFAULT_GRADE_COLOR,
							margin : '0 0 0 5',
							handler : function(obj, rgb) {
								me.colorPreview.setBodyStyle({
									'background-color' : "#" + rgb
								});
								me.gradeColor = rgb;
							}
						},
						text : 'Color'
					}).showMenu();
					return colorPicker;
				},
				getGradeColor : function() {
					return this.gradeColor;
				},
				getPreview : function(color) {
					var displayField = Ext.create('Ext.panel.Panel', {
						border : true,
						frame : false,
						margin : '0 0 0 5',
						width : 22,
						height : 22
					})
					displayField.setBodyStyle({
						'background-color' : color
					});
					return displayField;
				},
				getGraduateControl : function() {
					var colorPicker = this.getPickerControl(DEFAULT_GRADE_COLOR);
					this.colorPreview = this.getPreview('#' + DEFAULT_GRADE_COLOR);
					var me = this;
					var panel = Ext.create('Ext.panel.Panel', {
						layout : 'hbox',
						bodyCls: 'cmdb-blue-panel',
						border: false,
						items : [ {
							xtype : "numberfield",
							fieldLabel : CMDBuild.Translation.minRadius,
							name : 'minRadius',
							allowBlank : false,
							maxValue : 100,
							minValue : 1,
							value : CMDBuild.gis.constants.MIN_GRADE_RADIUS,
							margin : '0 0 0 5',
							listeners : {
								change : function(field, newValue, oldValue, eOpts) {
									var layoutConfiguration = me.getLayoutConfiguration();
									layoutConfiguration.minRadius = parseInt(newValue);
									me.parentWindow.refreshGridColors();
								}
							}
						}, {
							xtype : "numberfield",
							fieldLabel : CMDBuild.Translation.maxRadius,
							name : 'maxRadius',
							allowBlank : false,
							maxValue : 100,
							minValue : 1,
							value : CMDBuild.gis.constants.MAX_GRADE_RADIUS,
							margin : '0 0 0 5',
							listeners : {
								change : function(field, newValue, oldValue, eOpts) {
									var layoutConfiguration = me.getLayoutConfiguration();
									layoutConfiguration.maxRadius = parseInt(newValue);
									me.parentWindow.refreshGridColors();
								}
							}
						}, colorPicker, this.colorPreview ]
					});
					return panel;
				},
				init : function() {
					var layoutConfiguration = this.getLayoutConfiguration();
					var analysisType = this.parentWindow.getCurrentAnalysisType();
					switch (analysisType) {
					case CMDBuild.gis.constants.layers.PUNTUAL_ANALYSIS:
						this.items.getAt(0).hide();
						this.items.getAt(1).hide();
						break;
					case CMDBuild.gis.constants.layers.GRADUATE_ANALYSIS:
						this.items.getAt(0).hide();
						this.items.getAt(1).show();
						break;
					default:
						this.items.getAt(0).show();
						this.items.getAt(1).hide();
						break;
					}
					if (!layoutConfiguration.maxRadius) {
						layoutConfiguration.maxRadius = CMDBuild.gis.constants.MAX_GRADE_RADIUS;
					}
					if (!layoutConfiguration.minRadius) {
						layoutConfiguration.minRadius = CMDBuild.gis.constants.MIN_GRADE_RADIUS;
					}
					if (!layoutConfiguration.segmentsConfiguration) {
						layoutConfiguration.segmentsConfiguration = CMDBuild.gis.constants.DEFAULT_SEGMENTS;
					}
					this.parentWindow.initForm(this, layoutConfiguration);
				},
				loadComponents : function(callback, callbackScope) {
					this.init();
					callback.apply(callbackScope, []);
				}
			});
})();
