(function() {
	var MAX_BUFFER_SIZE = 5000;
	Ext.define('CMDBuild.view.management.classes.map.navigationTree.Cache', {
		cards : {},
		notInTree : {},
		push : function(className, cardId, value, where) {
			if (!where[className]) {
				where[className] = {};
			}
			where[className][cardId] = value;
		},
		pushNotInTree : function(card) {
			var className = card.className;
			var cardId = card.cardId;
			this.push(className, cardId, CMDBuild.gis.constants.navigation.CARD_WITHOUT_PARENT, this.notInTree);
		},
		pushNodes : function(nodes) {
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var className = node.raw.className;
				var cardId = node.raw.cardId;
				this.push(className, cardId, node, this.cards);
			}
		},
		getNotInTreeCard : function(card) {
			if (!(this.notInTree[card.className] && this.notInTree[card.className][card.cardId]))
				return null;
			return this.notInTree[card.className][card.cardId];
		},
		deleteCard : function(card) {
			if (this.cards[card.className] && this.cards[card.className][card.cardId]) {
				delete this.cards[card.className][card.cardId];
			}
			if (this.notInTree[card.className] && this.notInTree[card.className][card.cardId]) {
				delete this.notInTree[card.className][card.cardId];
			}
		},
		getCard : function(card) {
			if (!card)
				console.log("Error card = null!");
			if (!(this.cards[card.className] && this.cards[card.className][card.cardId]))
				return null;
			this.cards[card.className][card.cardId].lastGisVisit = Date.now();
			return this.cards[card.className][card.cardId];
		}
	});
})();