(function() {

	Ext.define('CMDBuild.bim.management.view.CMBimTree', {
		extend : 'Ext.tree.Panel',

		oldCard : undefined,
		initialized : false,
		active : undefined,
		/**
		 * 
		 * @property {CMDBuild.controller.management.classes.map.NavigationTreeDelegate}
		 * 
		 */
		delegate : undefined,

		constructor : function() {
			this.callParent(arguments);
		},

		initComponent : function() {
			this.activationCount = 0;
			var me = this;
			var SHOW_ICON = 'images/icons/bullet_go.png';
			var HIDE_ICON = 'images/icons/cancel.png';

			this.columns = [ {
				xtype : 'treecolumn',
				flex : 2,
				sortable : false,
				dataIndex : 'text',
				menuDisabled : true
			}, {
				width : 40,
				menuDisabled : true,
				xtype : 'actioncolumn',
				tooltip : CMDBuild.Translation.management.modcard.open_relation,
				align : 'center',
				sortable : false,
				icon : 'images/icons/bullet_go.png',
				handler : function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					var className = record.get("className");
					if (className !== "") {
						me.navigateOnCard(record);
					}
				},
			    renderer: function (value, metadata, record) {
			        if (record.get('leaf')) {
			            this.icon = 'images/icons/bullet_go.png';
			        } else {
			            this.icon = 'images/icons/add_filter.png';
			        }
			    },
			}, {
				width : 40,
				menuDisabled : true,
				xtype : 'actioncolumn',
				tooltip : CMDBuild.Translation.management.modcard.open_relation,
				align : 'center',
				sortable : false,
				handler : function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					var className = record.get("className");
					if (className !== "") {
						me.showCmdbuildCard(record);
					}
				},
			    renderer: function (value, metadata, record) {
			        if (record.get('leaf')) {
			            this.icon = 'images/icons/userInterface.png';
			        } 
			    },
			} ];
			this.callParent(arguments);
		},
		loaded : function(rootNode) {
			Ext.suspendLayouts();
			this.setRootNode(rootNode);
			Ext.resumeLayouts();
		},
		addDelegate : function(delegate) {
			this.delegate = delegate;
		},
		navigateOnCard : function(record) {
			this.delegate.selectNode(record.get("id"), record.get("leaf"));
		},
		showCmdbuildCard : function(record) {
			var objectId = record.get("id");
			var me = this;
			CMDBuild.bim.proxy.Bim.fetchCardFromViewewId({
				params : {
					revisionId : me.delegate.getCurrentRoid(),
					objectId : objectId
				},

				success : function(fp, request, response) {
					if (response.card) {
						me.delegate.openCardDataWindow(response.card);
					}
					else {
						//console.log("! found");
					}
				}
			});
		},
		populatePath : function(path, callback, callbackScope) {
			if (path.length === 0) {
				callback.apply(callbackScope, []);
				return;
			}
			var card = path.pop();
			var node = this.getFromCache(card.className, card.cardId);
			if (!node) {
				callback.apply(callbackScope, []);
				return;
			}
		},
		selectNode : function(nodeOid) {
			var record = this.store.getNodeById(nodeOid);
            this.getSelectionModel().select(record)	;
		}
	});
})();