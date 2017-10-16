(function() {

	Ext.define('CMDBuild.controller.management.classes.map.thematism.ThematismMainWindow', {
		extend : 'CMDBuild.controller.common.abstract.Base',

		requires : [ 'CMDBuild.view.management.classes.map.thematism.ThematismMainWindow' ],

		/**
		 * @cfg {??}
		 */
		parentDelegate : undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions : [ "onShowThematism" ],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.UserView}
		 */
		view : undefined,
		
		/**
		 * @property {CMDBuild.view.management.classes.map.geoextension.InteractionDocument}
		 */
		interactionDocument : undefined,

		/**
		 * @param {Object}
		 *            configurationObject
		 * @param {String}
		 *            configurationObject.title
		 * 
		 * @returns {Void}
		 * 
		 * @override
		 */
		constructor : function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.classes.map.thematism.ThematismMainWindow', {
				delegate : this,
				title : CMDBuild.Translation.thematismTitle,
				interactionDocument : this.interactionDocument
			});

		},
		show : function(layerName) {
			var thematicDocument = this.interactionDocument.getThematicDocument();
			var thematicLayer = thematicDocument.getLayerByName(layerName);
			if (thematicLayer && thematicLayer.get("adapter")) {
				var configuration = thematicLayer.get("adapter").getConfiguration();
				this.view.configure(configuration);
			}
			else if (! thematicLayer) {
				var configuration = thematicDocument.getDefaultThematismConfiguration();
				this.view.configure(configuration.configuration);
				
			}
			this.view.show(layerName);
		},

		/**
		 * @param {Object}
		 *            thematism
		 * @param {String}
		 *            thematism.name
		 * @param {ol.Layer}
		 *            thematism.layer
		 * @param {Object}
		 *            thematism.strategy
		 * 
		 * @returns {Void}
		 */
		onShowThematism : function(thematism) {
			var thematicDocument = this.interactionDocument.getThematicDocument();
			if (thematicDocument.getLayerByName(thematism.name) !== null) {
				thematicDocument.modifyThematism(thematism);
			} else {
				thematicDocument.addThematism(thematism);
			}
			var className = thematism.configuration.originalLayer.className;
			this.interactionDocument.setCurrentThematicLayer(className, thematism.name);
			this.interactionDocument.changedThematicDocument();

		}
	});

})();
