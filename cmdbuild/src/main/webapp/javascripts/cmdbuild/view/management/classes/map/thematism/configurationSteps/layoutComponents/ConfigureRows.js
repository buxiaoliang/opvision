(function() {
	Ext
			.define(
					"CMDBuild.view.management.classes.map.thematism.configurationSteps.layoutComponents.ConfigureRows",
					{
						extend : "Ext.panel.Panel",
						requires : [ 'CMDBuild.view.management.classes.map.proxy.Cards' ],
						itemId : "configureRows",
						layout : "anchor",
						bodyCls : 'cmdb-blue-panel',
						border : false,

						defaults : {
							anchor : "100%"
						},
						parentWindow : undefined,
						interactionDocument : undefined,
						comboFields : undefined,

						colorsStore : undefined,
						fieldsStore : undefined,

						/**
						 * @returns {Void}
						 *
						 * @override
						 */
						initComponent : function() {
							var me = this;
							// this panel only for have scroolbars on the Grid
							this.createControls();
							var item = Ext.create('Ext.panel.Panel', {
								title : '',
								width : 800,
								height : 600,
								autoScroll : "true",
								layout : 'fit',
								header : false,
								items : [ this.grid ]
							});
							Ext.apply(this, {
								items : [ this.comboFields, item ]
							});
							this.callParent(arguments);
						},
						chargeStore : function(cardsStore, cardsArray, callback, callbackScope) {
							var layoutConfiguration = this.getLayoutConfiguration();
							var functionConfiguration = this.getFunctionConfiguration();
							var thematismConfiguration = this.getThematismConfiguration();
							var thematicDocument = this.interactionDocument.getThematicDocument();
							var attributeName = this.parentWindow.getCurrentAttribute();
							var currentStrategy = this.parentWindow.getCurrentStrategy();
							var field = {
								value : this.comboFields.value,
								type : functionConfiguration.attributeType
							};
							var analysis = {
								type : this.parentWindow.getCurrentAnalysisType(),
								layoutConfiguration : layoutConfiguration,
								strategy : currentStrategy
							};
							var groups = thematicDocument.groupData(field, analysis, this.parentWindow
									.getCurrentSourceType(), cardsArray, attributeName);
							var index = 0;
							for ( var key in groups) {
								var color = "ffffff";
								if (CMDBuild.gis.constants.layers.GRADUATE_ANALYSIS !== thematismConfiguration.analysis) {
									color = thematicDocument.getColor(key, layoutConfiguration.colorsTable, analysis.type,
											index++);
								}
								cardsStore.add({
									value : key,
									cardinality : groups[key].count,
									cards : groups[key].cards,
									color : color
								});
							}
							callback.apply(callbackScope, []);
						},
						createControls : function() {
							this.colorsStore = Ext.create("Ext.data.Store", {
								fields : [ "value", "cardinality", "color" ],
								data : []
							});
							this.fieldsStore = Ext.create("Ext.data.Store", {
								fields : [ "name", "description" ],
								data : []
							});
							this.comboFields = Ext
									.create(
											"Ext.form.field.ComboBox",
											{
												fieldLabel : CMDBuild.Translation.thematicField,
												store : this.fieldsStore,
												name : "resultFieldName",
												queryMode : "local",
												displayField : "description",
												valueField : "name",
												editable : false,
												allowBlank : false,
												triggerAction : "all",
												maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM,

												listeners : {
													scope : this,
													change : function(field, newValue, oldValue) {
														var currentStrategy = this.parentWindow.getCurrentStrategy();
														var functionConfiguration = this.getFunctionConfiguration();
														if (this.parentWindow.getCurrentSourceType() === CMDBuild.gis.constants.layers.FUNCTION_SOURCE) {
															var attributeType = getAttributeType(newValue,
																	currentStrategy.attributes);
															functionConfiguration.attributeType = attributeType;
														}
														this.refreshResults(this.grid, function() {
														}, this);
													}
												}
											});
							var colorPicker = Ext.create('CMDBuild.view.common.field.picker.Color');
							this.grid = Ext.create("Ext.grid.Panel", {
								title : "",
								store : this.colorsStore,
								plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
									clicksToEdit : 1
								}) ],
								columns : [ {
									text : CMDBuild.Translation.value,
									dataIndex : "value",
									flex : 1
								}, {
									text : CMDBuild.Translation.cardinality,
									dataIndex : "cardinality"
								}, {
									text : CMDBuild.Translation.thematicColor,
									dataIndex : "color",
									renderer : function(value, metaData) {
										metaData.style = "background-color:" + value + ";font-size:" + 0;
										return value;
									},
									editor : colorPicker
								} ],
								height : "100%",
								width : "100%"
							});
						},
						getColorsTable : function() {
							var rows = [];
							this.colorsStore.each(function(row) {
								rows.push({
									value : row.get("value"),
									cardinality : row.get("cardinality"),
									color : row.get("color"),
									cards : row.get("cards")
								});
							});
							return rows;
						},
						getLayoutConfiguration : function() {
							return this.parentWindow.getLayoutConfiguration();
						},
						getFunctionConfiguration : function() {
							return this.parentWindow.getFunctionConfiguration();
						},
						getThematismConfiguration : function() {
							return this.parentWindow.getThematismConfiguration();
						},
						init : function() {
							var layoutConfiguration = this.getLayoutConfiguration();
							this.parentWindow.initForm(this, layoutConfiguration);
						},
						loadComponents : function(callback, callbackScope) {
							this.loadFields(function() {
								this.refreshResults(this.grid, function() {
									this.init();
									this.comboFields.select(this.comboFields.getStore().getAt(0));

									callback.apply(callbackScope, []);
								}, this);
							}, this);
						},
						loadFields : function(callback, callbackScope) {
							var card = this.interactionDocument.getCurrentCard();
							if (!card) {
								callback.apply(callbackScope, this);
								return;
							}
							var fieldsStore = Ext.create("Ext.data.Store", {
								fields : [ "name", "description" ],
								autoLoad : false,
								data : []
							});
							var currentStrategy = this.parentWindow.getCurrentStrategy();
							if (this.parentWindow.getCurrentSourceType() === CMDBuild.gis.constants.layers.FUNCTION_SOURCE) {
								var attributes = currentStrategy.attributes;
								for (var i = 0; i < attributes.length; i++) {
									var attribute = attributes[i];
									if (attribute.name !== "Id") {
										fieldsStore.add({
											"description" : attribute.description,
											"name" : attribute.name
										});
									}
								}
							} else {
								fieldsStore.add({
									"description" : "Value",
									"name" : "value"
								});

							}
							this.fieldsStore.loadData(fieldsStore.getRange(), false);
							callback.apply(callbackScope, this);
						},
						refreshResults : function(grid, callback, callbackScope) {
							var layer = this.interactionDocument.getGeoLayerByName(this.parentWindow.getCurrentLayer());
							var card = this.interactionDocument.getCurrentCard();
							var currentClassName = (!card) ? "" : card.className;
							var currentResultsStore = Ext.create("Ext.data.Store", {
								fields : [ "value", "cardinality", "color", "cards" ],
								autoLoad : false,
								data : []
							});
							var cardsArray = [];
							this.loadCards(currentClassName, function(cards) {
								this.chargeStore(currentResultsStore, cards, function() {
									grid.getStore().loadData(currentResultsStore.getRange(), false);
									callback.apply(callbackScope, []);
								}, this);
							}, this);
						},
						loadCards : function(className, callback, callbackScope) {
							var params = {};
							params[CMDBuild.core.constants.Proxy.CLASS_NAME] = className;
							if (this.parentWindow.getCurrentSourceType() === CMDBuild.gis.constants.layers.FUNCTION_SOURCE) {
								var currentStrategy = this.parentWindow.getCurrentStrategy();
								params["strategy"] = currentStrategy;
								var strategiesManager = this.interactionDocument.getStrategiesManager();
								strategiesManager.functionValue(params, function(data) {
									callback.apply(callbackScope, [ data ]);

								});
							} else {
								CMDBuild.view.management.classes.map.proxy.Cards.read({
									params : params,
									loadMask : false,
									success : function(result, options, decodedResult) {
										var data = decodedResult.rows;
										callback.apply(callbackScope, [ data ]);
									}
								});
							}
						},
						refreshGridColors : function() {
							this.refreshResults(this.grid, function() {
							}, this);
						}
					});
	function getAttributeType(key, attributes) {
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			if (attribute._id === key) {
				return attribute.type;
			}
		}
		return "STRING";
	}
})();
