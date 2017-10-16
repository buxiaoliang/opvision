(function() {
	Ext.define("CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureFieldFunction", {
		extend : "CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureFunction",
		requires : [ 'CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureFunction' ],
		itemId : "configureFieldFunction",

		strategiesStore : undefined,
		comboStrategies : undefined,
		/*
		 * @property
		 * Object [name attribute: type]
		 */
		attributes : undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent : function() {
			var me = this;
			this.attributesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value", "type" ],
				data : []
			});
			this.strategiesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value" ],
				data : []
			});
			this.comboAttributes = Ext.create("Ext.form.field.ComboBox", {
				fieldLabel : CMDBuild.Translation.attribute,
				store : this.attributesStore,
				name : "attribute",
				queryMode : "local",
				displayField : "description",
				valueField : "value",
				editable : false,
				allowBlank : false,
				maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM
			});
			this.comboStrategies = Ext.create("Ext.form.field.ComboBox", {
				fieldLabel : CMDBuild.Translation.thematicField,
				store : this.strategiesStore,
				name : "currentStrategy",
				queryMode : "local",
				displayField : "description",
				valueField : "value",
				editable : false,
				allowBlank : false,
				triggerAction : "all",
				maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM

			});
			Ext.apply(this, {
				items : [ this.comboAttributes, this.comboStrategies ]
			});
			this.callParent(arguments);
		},
		loadStrategies : function(callback, callbackScope) {
			this.loadFieldStrategies(function() {
				this.loadAttributes(function() {
					//this.comboStrategies.select(this.comboStrategies.getStore().getAt(0));
					callback.apply(callbackScope, []);
				}, this);
			}, this);
		},
		loadFieldStrategies : function(callback, callbackScope) {
			var strategiesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value" ],
				autoLoad : false,
				data : []
			});
			this.interactionDocument.getFieldStrategies(function(strategies) {
				for ( var key in strategies) {
					var strategy = strategies[key];
					strategiesStore.add({
						"description" : strategy.description,
						"value" : strategy.description
					});
				}
				this.comboStrategies.store.loadData(strategiesStore.getRange(), false);
				callback.apply(callbackScope, this);
			}, this);
		},
		loadAttributes : function(callback, callbackScope) {
			var card = this.interactionDocument.getCurrentCard();
			if (!card) {
				return;
			}
			var attributesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value", "type" ],
				autoLoad : false,
				data : []
			});
			var currentClassName = card.className;
			var me = this;
			this.attributes = {};
			this.interactionDocument.getAttributeList(currentClassName, function(attributes) {
				for (var i = 0; i < attributes.length; i++) {
					var attribute = attributes[i];
					attributesStore.add({
						"description" : attribute.description,
						"value" : attribute.name
					});
					me.attributes[attribute.name] = attribute.type;
				}

				me.comboAttributes.store.loadData(attributesStore.getRange(), false);
				callback.apply(callbackScope, this);
			}, this);
		}

	});
})();
