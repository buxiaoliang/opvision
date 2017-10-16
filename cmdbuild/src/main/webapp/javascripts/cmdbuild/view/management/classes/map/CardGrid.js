(function() {

	Ext.define("CMDBuild.view.management.classes.map.CMCardGridPagingBar", {
		extend : "Ext.toolbar.Paging",

		// configuration
		grid : undefined
	// configuration
	});

	Ext.define('CMDBuild.view.management.classes.map.CardGrid', {
		extend : 'Ext.grid.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.classes.map.CardGrid}
		 */
		delegate : undefined,

		border : false,
		cls : 'cmdb-border-bottom',
		frame : false,
		map : undefined,

		/**
		 * @property {Boolean}
		 */
		noSelect : false,

		/**
		 * @property {Object} oldCard
		 * @property {Id} oldCard.cardId
		 * @property {String} oldCard.className
		 */
		oldCard : undefined,
		fromMe : undefined,
		/**
		 * @returns {Void}
		 * 
		 * @override
		 */
		initComponent : function() {
			var store = this.getStoreForFields([]);
			var thisGrid = this;
			var me = this;
			buildPagingBar(this);
			Ext.apply(this, {
				columns : [],
				store : store
			});
			this.interactionDocument.observe(this);

			this.callParent(arguments);
		},

		listeners : {
			activate: function() {
				console.log("activate");
				this.active = true;
				var card = this.interactionDocument.getCurrentCard();
				if (card) {
					this.refresh();
				}
			},
			deactivate: function() {
				this.active = false;
			},
			select : function(row, record, index) {
				if (!this.noSelect) {
					var classId = record.get("IdClass");
					var type = this.interactionDocument.getEntryTypeById(classId);
					var className = type.get("name");
					var cardId = record.get("id");
					var card = {
						cardId : cardId,
						className : className
					};
					this.interactionDocument.checkNavigationTree(card);
					this.interactionDocument.setNoZoom(true);
					this.fromMe = true;
					this.navigateOnCard(record);
				}
			}
		},

		/**
		 * @param {Object}
		 *            record
		 * @param {String}
		 *            record.Id
		 * @param {String}
		 *            record.IdClass
		 * 
		 * @returns {Void}
		 */
		navigateOnCard : function(record) {
			this.delegate.cmfg('onCardNavigation', {
				Id : record.get('Id'),
				IdClass : record.get('IdClass')
			});
		},
		zoomOnCard : function(record) {
			this.delegate.cmfg('onCardZoom', {
				Id : record.get('Id'),
				IdClass : record.get('IdClass')
			});
		},
		// protected
		getStoreExtraParams : function() {
			return this.store.getProxy().extraParams;
		},
		// protected
		buildClassColumn : function() {
			return {
				header : CMDBuild.Translation.subClass,
				width : 100,
				sortable : false,
				dataIndex : this.CLASS_COLUMN_DATA_INDEX
			};
		},
		refresh : function() {
			if (this.fromMe || ! this.active) {
				this.fromMe = false;
				return;
			}
			var currentCard = this.interactionDocument.getCurrentCard();
			if (sameCard(currentCard, this.oldCard)) {
				return;
			}
			var currentClassName = "";
			if (!currentCard) {
				currentClassName = this.interactionDocument.getCurrentClassName();
			} else {
				currentClassName = currentCard.className;

			}
			if (!currentClassName) {
				return;
			}
			this.store.proxy.setExtraParam("className", currentClassName);
			if (!this.oldCard || this.oldCard.className !== currentClassName) {
				updateTitle(currentClassName, this);
				var cl = this.interactionDocument.getEntryTypeByName(currentClassName);
				var me = this;
				me.store.proxy.setExtraParam("className", currentClassName);
				if (cl) {
					this.updateStoreForClassId(cl.get("id"), function() {
						me.jumpOnPosition(currentCard);
					}, this);
				}
			} else {
				this.jumpOnPosition(currentCard);
			}
			this.oldCard = currentCard;
		},
		jumpOnPosition : function(currentCard) {
			if (!currentCard) {
				return;
			}
			this.getPosition(this.store, currentCard, function(position) {
				this.store.proxy.setExtraParam("className", currentCard.className);
				if (!position.found) {
					this.store.loadPage(1);
				} else {
					var pageNumber = CMDBuild.core.Utils.getPageNumber(position.position);
					var pageSize = CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT);
					var relativeIndex = position.position % pageSize;
					var me = this;
					this.store.on('load', function(store, records, successful, eOpts) {
						me.selectAt(relativeIndex);
					});
					this.store.loadPage(pageNumber);
				}
			}, this);

		},
		selectAt : function(index) {
			try {
				var sm = this.getSelectionModel();
				sm.deselectAll();
				this.noSelect = true;
				sm.select(index);
				this.noSelect = false;
			} catch (e) {
				this.noSelect = false;
			}
		},
		// protected
		loadAttributes : function(classId, cb) {
			this.interactionDocument.getAttributeListById(classId, cb, this);
		},
		// protected
		addRendererToHeader : function(h) {
			h.renderer = function(value, metadata, record, rowIndex, colIndex, store, view) {
				value = value || record.get(h.dataIndex);

				if (typeof value == 'undefined' || value == null) {
					return '';
				} else if (typeof value == 'object') {
					/**
					 * Some values (like reference or lookup) are serialized as
					 * object {id: "", description:""}. Here we display the
					 * description
					 */
					value = value.description;
				} else if (typeof value == 'boolean') {
					value = value ? Ext.MessageBox.buttonText.yes : Ext.MessageBox.buttonText.no;
				} else if (typeof value == 'string') {
					value = Ext.util.Format.stripTags(value);
				}

				return value;
			};
		},
		getPosition : function(store, currentCard, callback, callbackScope) {
			if (!currentCard.className) {
				callback.apply(callbackScope, [ {
					position : 0,
					found : false
				} ]);
				return;
			}
			var params = Ext.apply({}, store.proxy.extraParams);
			params[CMDBuild.core.constants.Proxy.CARD_ID] = currentCard.cardId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = currentCard.className;
			params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(getSorting(store));

			CMDBuild.proxy.Card.readPosition({
				params : params,
				loadMask : false,
				success : function(response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					var position = decodedResponse[CMDBuild.core.constants.Proxy.POSITION];
					var found = decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION];
					callback.apply(callbackScope, [ {
						position : position,
						found : found
					} ]);
				}
			});
		},

		updateStoreForClassId : function(classId, callback, callbackScope) {
			var me = this;

			this.loadAttributes(classId, function(attributes) {
				if (me.currentClassId == classId) {
					callback.apply(callbackScope, []);
				} else {
					me.currentClassId = classId;

					if (me.gridSearchField) {
						me.gridSearchField.setValue("");
					}

					if (me.cmAdvancedFilter)
						me.controllerAdvancedFilterButtons.cmfg('entryTypeSet', {
							value : me.interactionDocument.getEntryTypeById(classId).getData()
						});

					if (me.printGridMenu) {
						me.printGridMenu.setDisabled(!classId);
					}

					me.setColumnsForClass(attributes);
					callback.apply(callbackScope, []);
				}
			});
		},

		// protected
		getStoreForFields : function(fields) {
			var pageSize = CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT);
			var s = this.buildStore(fields, pageSize);

			return s;
		},

		/**
		 * @param {Array}
		 *            fields
		 * @param {Number}
		 *            pageSize
		 * 
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 * 
		 * @private
		 * 
		 * TODO: waiting for refactor (build grid proxy)
		 */
		buildStore : function(fields, pageSize) {
			fields.push({
				name : 'Id',
				type : 'int'
			});
			fields.push({
				name : 'IdClass',
				type : 'int'
			});
			fields.push('IdClass_value');

			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.CARD, {
				autoLoad : false,
				fields : fields,
				pageSize : pageSize,
				remoteSort : true,
				proxy : {
					type : 'ajax',
					url : CMDBuild.proxy.index.Json.card.readAll,
					reader : {
						type : 'json',
						root : 'rows',
						totalProperty : 'results',
						idProperty : 'Id'
					},
					extraParams : null
				},
				listeners : {
					beforeload : function(a, b, c) {
					}
				}
			});
		},
		// protected
		setColumnsForClass : function(classAttributes) {
			var columns = this.buildColumnsForAttributes(classAttributes);
			var s = this.getStoreForFields(columns.fields);

			this.suspendLayouts();
			this.reconfigure(s, columns.headers);
			this.resumeLayouts(true);

			if (this.pagingBar) {
				this.pagingBar.bindStore(s);
			}

		},

		// protected
		buildColumnsForAttributes : function(classAttributes) {
			this.classAttributes = classAttributes;
			var headers = [];
			var fields = [];

			if (_CMUtils.isSuperclass(this.currentClassId)) {
				headers.push(this.buildClassColumn());
			}

			for (var i = 0; i < classAttributes.length; i++) {
				var attribute = classAttributes[i];
				var header = CMDBuild.Management.FieldManager.getHeaderForAttr(attribute);

				if (header && header.dataIndex != 'IdClass_value') {

					this.addRendererToHeader(header);
					headers.push(header);
					fields.push(header.dataIndex);
				} else if (attribute.name == "Description") {
					fields.push("Description");
				}
			}
			return {
				headers : headers,
				fields : fields
			};
		}
	});
	function buildPagingBar(me) {
		var items = [];
		var cmBasicFilter = [];
		me.cmBasicFilter = true;
		if (me.cmBasicFilter) {
			me.gridSearchField = new CMDBuild.field.GridSearchField({
				grid : me
			});
			items.push(me.gridSearchField);
		}

		me.pagingBar = new CMDBuild.view.management.common.CMCardGridPagingBar({
			grid : me,
			store : me.store,
			displayInfo : true,
			displayMsg : '{0} - {1} ' + CMDBuild.Translation.of + ' {2}',
			emptyMsg : CMDBuild.Translation.noTopicsToDisplay,
			items : items
		});

		me.bbar = me.pagingBar;
	}

	function getSorting(store) {
		var sorters = store.getSorters();
		var out = [];
		for (var i = 0, l = sorters.length; i < l; ++i) {
			var s = sorters[i];
			out.push({
				property : s.property,
				direction : s.direction
			});
		}

		return out;
	}
	function sameCard(newCard, oldCard) {
		if (!oldCard || !newCard) {
			return false;
		}
		return (oldCard.cardId == newCard.cardId && oldCard.className == newCard.className);
	}
	function updateTitle(className, grid) {
		var prefix = CMDBuild.Translation.management.modcard.title;
		grid.setTitle(prefix + className);
	}

})();
