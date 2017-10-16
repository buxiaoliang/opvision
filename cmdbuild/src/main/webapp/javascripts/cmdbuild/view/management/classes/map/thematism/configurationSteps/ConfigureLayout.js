(function() {
	Ext
			.define(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureLayout",
					{
						extend : "Ext.form.Panel",
						itemId : "configureLayout",
						xtype : "form",
						layout : "anchor",
						bodyCls: 'cmdb-blue-panel',
						requires : [
								// 'CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureShape',
								'CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureSegments',
								'CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureRows' ],

						parentWindow : undefined,
						interactionDocument : undefined,
						// controlShape : undefined,
						controlSegments : undefined,
						controlRows : undefined,
						configurationPanel : undefined,

						defaults : {
							anchor : "100%"
						},
						getFunctionConfiguration : function() {
							return this.parentWindow.getFunctionConfiguration();
						},
						getLayoutConfiguration : function() {
							return this.parentWindow.getLayoutConfiguration();
						},
						getThematismConfiguration : function() {
							return this.parentWindow.getThematismConfiguration();
						},
						getCurrentLayer : function() {
							return this.parentWindow.getCurrentLayer();
						},
						getCurrentSourceType : function() {
							return this.parentWindow.getCurrentSourceType();
						},
						getCurrentLayerType : function() {
							return this.parentWindow.getCurrentLayerType();
						},
						getCurrentStrategy : function() {
							return this.parentWindow.getCurrentStrategy();
						},
						getCurrentAnalysisType : function() {
							return this.parentWindow.getCurrentAnalysisType();
						},
						getCurrentAttribute : function() {
							return this.parentWindow.getCurrentAttribute();
						},
						refreshGridColors : function() {
							return this.controlRows.refreshGridColors();
						},
						getHtmlTitle : function() {
							var configuration = this.parentWindow.getThematismConfiguration();
							var strHtml = "<p>" + CMDBuild.Translation.name + " : ";
							strHtml += configuration.layerName;
							strHtml += "</p>";
							strHtml += "<p>" + CMDBuild.Translation.thematicAnalysis + " : ";
							strHtml += this.parentWindow.getAnalysisDescription(configuration.analysis);
							strHtml += "</p>";
							strHtml += "<p>" + CMDBuild.Translation.thematicSource + " : ";
							strHtml += this.parentWindow.getSourceDescription(configuration.source);
							strHtml += "</p>";
							return strHtml;
						},

						getColorsTable : function() {
							var rows = this.controlRows.getColorsTable();
							return rows;
						},

						/**
						 * @param
						 * {CMDBuild.view.management.classes.map.thematism.ThematismMainWindow}
						 * parentWindow
						 * @param {String}
						 *            itemId
						 *
						 * @returns {Array} extjs items
						 */
						getButtons : function() {
							var itemId = this.itemId;
							var parentWindow = this.parentWindow;
							var me = this;
							return [ {
								text : CMDBuild.Translation.cancel,
								handler : function() {
									parentWindow.close();
								}
							}, {
								text : CMDBuild.Translation.previous,
								handler : function() {
									parentWindow.previous(itemId);
								}
							}, {
								text : CMDBuild.Translation.thematismShow,
								formBind : true,
								disabled : true,
								handler : function() {
									var form = this.up('form').getForm();
									var configurationObject = form.getValues();
									configurationObject.colorsTable = me.getColorsTable();
									configurationObject.gradeColor = me.controlSegments.getGradeColor();
									parentWindow.showOnMap(configurationObject);
								}
							} ];
						},

						init : function() {
							var layoutConfiguration = this.getLayoutConfiguration();
							this.parentWindow.initForm(this, layoutConfiguration);
						},

						/**
						 * @returns {Void}
						 *
						 * @override
						 */
						initComponent : function() {
							var me = this;
							this.configurationPanel = Ext.create("Ext.panel.Panel", {
								html : "",
								bodyCls: 'cmdb-blue-panel',
								border: false
							});
							this.initControls();
							Ext.apply(this, {
								items : [ this.configurationPanel, /* this.controlShape, */this.controlSegments,
										this.controlRows ],
								buttons : this.getButtons()
							});
							this.callParent(arguments);
						},
						initForm : function(form, layoutConfiguration) {
							this.parentWindow.initForm(form, layoutConfiguration);
						},
						initControls : function() {
							this.controlSegments = Ext
									.create(
											"CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureSegments",
											{
												interactionDocument : this.interactionDocument,
												parentWindow : this
											});
							this.controlRows = Ext
									.create(
											"CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureRows",
											{
												interactionDocument : this.interactionDocument,
												parentWindow : this
											});

						},
						loadComponents : function(callback, callbackScope) {
							this.configurationPanel.update(this.getHtmlTitle());
							this.controlSegments.loadComponents(function() {
								this.controlRows.loadComponents(function() {
									callback.apply(callbackScope, []);
								}, this);
							}, this);
						}
					});

})();