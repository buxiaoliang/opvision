(function() {
	Ext.define("CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureSourceFunction", {
		extend : "CMDBuild.view.management.classes.map.thematism.configurationSteps.ConfigureFunction",
		itemId : "configureSourceFunction",

		strategiesStore : undefined,
		comboStrategies : undefined,

		attributes : undefined,

		/**
		 * @returns {Void}
		 * 
		 * @override
		 */
		initComponent : function() {
			var me = this;
			this.strategiesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value" ],
				data : []
			});
			this.comboStrategies = Ext.create("Ext.form.field.ComboBox", {
				fieldLabel : CMDBuild.Translation.thematicStrategy,
				store : this.strategiesStore,
				queryMode : "local",
				displayField : "description",
				name : "currentStrategy",
				valueField : "value",
				allowBlank : false,
				maxWidth : CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM

			});
			Ext.apply(this, {
				items : [ this.comboStrategies ]
			});
			this.callParent(arguments);
		},
		loadStrategies : function(callback, callbackScope) {
			var strategiesStore = Ext.create("Ext.data.Store", {
				fields : [ "description", "value" ],
				autoLoad : false,
				data : []
			});
			this.interactionDocument.getFunctionStrategies(function(strategies) {
				this.loadStore(strategies, strategiesStore);
				this.comboStrategies.store.loadData(strategiesStore.getRange(), false);
				callback.apply(callbackScope, this);
			}, this);
		},
		loadStore : function(strategies, store) {
			this.attributes = {};
			for ( var key in strategies) {
				var strategy = strategies[key];
				var strategyTypes = strategy.metadata[CMDBuild.gis.constants.metadata.TAGS];
				var strategyClass = strategy.metadata[CMDBuild.gis.constants.metadata.MASTERTABLE];
				if (!(strategyTypes && strategyClass)) {
					continue;
				}
				if (strategyTypes.indexOf(CMDBuild.gis.constants.metadata.THEMATICFUNCTION) === -1) {
					continue;
				}
				var currentCard = this.interactionDocument.getCurrentCard();
				var currentClassName = currentCard.className;
				if (strategyClass !== currentClassName) {
					continue;
				}
				store.add({
					"description" : strategy.description,
					"value" : strategy.description
				});
				this.attributes[strategy.description] = strategy.attributes;
			}

		}
	});
})();
