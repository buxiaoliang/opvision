(function() {

	/**
	 * This is the implementation of the CMCardBrowserTreeDelegate for the
	 * CMMapController.
	 */
	Ext.define("CMDBuild.controller.management.classes.map.NavigationTreeDelegate", {
		interactionDocument : undefined,
		constructor : function(master, interactionDocument) {
			this.interactionDocument = interactionDocument;
		},
		/**
		 * @param {Object}
		 *            card
		 * @param {Number}
		 *            card.Id
		 * @param {Number}
		 *            card.IdClass
		 * 
		 * @returns {Void}
		 */
		onCardNavigation : function(card) {
			if (!card.id) {
				card.id = card.Id;
			}
			CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', card);
		},
		onCardZoom : function(card) {
			this.interactionDocument.centerOnCard(card, function() {
			}, this);
		}
	});

})();