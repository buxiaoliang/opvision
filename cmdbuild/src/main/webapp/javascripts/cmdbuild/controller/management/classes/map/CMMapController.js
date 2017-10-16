(function() {

	Ext.define("CMDBuild.controller.management.classes.map.CMMapController", {
		// Legacy class name
		alternateClassName : "CMDBuild.controller.management.classes.CMMapController",
		extend : "CMDBuild.controller.management.classes.CMCardDataProvider",

		mixins : {
			observable : "Ext.util.Observable",
			mapDelegate : "CMDBuild.view.management.map.CMMapPanelDelegate",
			editingWindowDelegate : "CMDBuild.controller.management.classes.map.CMMapEditingWindowDelegate",
			cardStateDelegate : "CMDBuild.state.CMCardModuleStateDelegate",
			miniCardGridDelegate : "CMDBuild.view.management.common.CMMiniCardGridDelegate"
		},

		cmfgCatchedFunctions : [],

		cardDataName : "geoAttributes",

		constructor : function(mapPanel, interactionDocument) {
			var me = this;
			this.interactionDocument = interactionDocument;
			if (mapPanel) {
				this.mapPanel = mapPanel;
				this.mapPanel.addDelegate(this);
				this.cmIsInEditing = false;

				var navigationPanel = this.mapPanel.getCardBrowserPanel();
				if (navigationPanel) {
					this.makeNavigationTree(navigationPanel);
				}

				// initialize editing control
				this.makeEditingDelegate();
				this.mapPanel.editingWindow.addDelegate(this.editingWindowDelegate);

				_CMCardModuleState.addDelegate(this);

			} else {
				throw new Error("The map controller was instantiated without a map or the related form panel");
			}
		},
		onAddCardButtonClick : function() {
			this.editMode();
		},
		makeEditingDelegate : function() {
			this.editingWindowDelegate = new CMDBuild.controller.management.classes.map.CMMapEditingWindowDelegate(
					this, this.interactionDocument);
		},
		makeNavigationTree : function(navigationPanel) {
			var navigationTreeDelegate = Ext.create(
					'CMDBuild.controller.management.classes.map.NavigationTreeDelegate', {
						interactionDocument : this.interactionDocument
					});
			navigationPanel.addDelegate(navigationTreeDelegate);
		},

		/*
		 * card could be either a String (the id of the card) or a
		 * Ext.model.Model
		 */
		onCardSelected : function(card) {
			var et = _CMCache.getEntryTypeById(this.currentClassId);
			if (!et) {
				return;
			}
			var oldCard = this.interactionDocument.getCurrentCard();
			var cardId = -1;
			var className = "";
			if (!card && !oldCard) {
				return;
			} else {
				cardId = (card) ? card.cardId : -1;
				className = (card) ? et.get("name") : oldCard.className;
			}
			if (cardId !== -1) {
				this.setCard({
					cardId : cardId,
					className : className
				});
			}
			this.interactionDocument.setCurrentCard({
				cardId : cardId,
				className : className
			});
			if (card && (!(oldCard && card) || (oldCard.className !== card.className))) {
				this.interactionDocument.resetZoom();
			}
			if (!this.mapPanel.cmVisible) {
			} else if (cardId !== -1) {
				var card = {
					className : className,
					cardId : cardId
				};
				this.interactionDocument.centerOnCard(card, function(center) {
					if (!center) {
						var mapPanel = this.interactionDocument.getMapPanel();
						mapPanel.center(this.interactionDocument.configurationMap);
					}
				}, this);
			} else {
				if (!oldCard || className !== oldCard.className) {
					var mapPanel = this.interactionDocument.getMapPanel();
					mapPanel.center(this.interactionDocument.configurationMap);

				}
				this.interactionDocument.changed();
			}
			if (this.mapPanel.cmVisible && (!oldCard || className !== oldCard.className)) {
				this.interactionDocument.changedThematicDocument();
			}
			this.interactionDocument.setNoZoom(false);
		},

		setCard : function(card, callback, callbackScope) {
		},
		editMode : function() {
			this.cmIsInEditing = true;

			if (this.mapPanel.cmVisible) {
				this.mapPanel.editMode();
				this.deactivateSelectControl();
			}
		},

		displayMode : function() {
			this.cmIsInEditing = false;

			if (this.mapPanel.cmVisible) {
				this.interactionDocument.setVisible(true);
				this.mapPanel.displayMode();
				this.activateSelectControl();
				this.interactionDocument.changed();
			} else {
				this.interactionDocument.setVisible(false);
				this.mapPanel.getMap().removeAllLayers();
			}
		},

		onCardSaved : function(c) {
			if (this.mapPanel.cmVisible) {
				var me = this;

				var type = _CMCache.getEntryTypeById(c.IdClass);
				var card = {
					cardId : c.Id,
					className : type.get("name")
				};
				this.setCard(card, this.callBackSetCard);
			}
		},
		callBackCenter : function() {
			this.interactionDocument.changed();
			this.interactionDocument.changedFeature();
		},
		callBackSetCard : function(card) {
			this.mapPanel.getMap().changeFeatureOnLayers(card.cardId);
			this.interactionDocument.setCurrentCard(card);
			this.interactionDocument.resetZoom();
			this.interactionDocument.centerOnCard(card, this.callBackCenter, this);

		},
		deactivateSelectControl : function() {
			// this.selectControl.deactivate();
		},

		activateSelectControl : function() {
			// this.selectControl.activate();
		},

		onEntryTypeSelected : this.onEntryTypeSelected,
		getCardData : getCardData,

		/* As mapDelegate ******** */

		onMapPanelVisibilityChanged : this.onVisibilityChanged,

		/* As CMCardModuleStateDelegate ************** */

		onEntryTypeDidChange : function(state, entryType, danglingCard) {
			if (!entryType) {
				return;
			}
			this.interactionDocument.setCurrentClassName(entryType.get("name"));
			var newEntryTypeId = entryType.get("id");
			var lastCard = _CMCardModuleState.card;
			if (this.currentClassId != newEntryTypeId) {
				this.currentClassId = newEntryTypeId;
				lastCard = undefined;
				this.onCardSelected({
					cardId : -1,
					className : entryType.get("name")

				});
			}

		},

		onCardDidChange : function(state, card) {
			if (card != null) {
				var type = _CMCache.getEntryTypeById(card.get("IdClass"));
				this.onCardSelected({
					cardId : card.get("Id"),
					className : type.get("name")

				});
			}
		},
		changeCardSilently : function(card) {
			this.interactionDocument.setCurrentCard(card);
		}

	});
	function getCardData(params) {
		var cardId = (params.cardId !== null) ? params.cardId : -1;
		var className = params.className;
		this.interactionDocument.changedCard(params);// having no a save
														// event this has to be
														// good
		var geo = this.mapPanel.getMap().getGeometries(cardId, className);
		if (geo !== null) {
			return Ext.JSON.encode(geo);
		}
		return null;
	}
})();
