(function() {

	/**
	 * @link CMDBuild.view.management.classes.CMCardRelationsPanel
	 *
	 * @legacy
	 */

	// Null-object to skip some checks
	var nullButton = {
		enable: function() {},
		disable: function() {},
		on: function() {}
	};

	Ext.define("CMRelationPanelModel", {
		extend: "Ext.data.Model",

		fields: [
			'dom_id', 'dom_desc', 'label',
			'dst_code', 'dst_id', 'dst_desc', 'dst_cid',
			'rel_attr', 'rel_date', 'rel_id',
			'relations_size', 'src'
		]
	});

	Ext.define("CMDBuild.view.management.workflow.panel.form.tabs.relations.RelationsView", {
		extend: "Ext.tree.Panel",

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.Relations}
		 */
		delegate: undefined,

		border: false,
		frame: false,
		title: CMDBuild.Translation.relations,

		initComponent: function() {
			this.buildTBar();

			this.attrsColumn = new Ext.grid.column.Column({
				header: CMDBuild.Translation.administration.modClass.tabs.attributes,
				hideMode: "visibility", // Otherwise it fails calling twice hide() on it
				flex: 3,
				sortable: false,
				dataIndex: "rel_attr"
			});

			Ext.apply(this, {
				loadMask: false,
				hideMode: "offsets",
				store: new Ext.data.TreeStore({
					model: "CMRelationPanelModel",
					root : {
						expanded : true,
						children : []
					},
					autoLoad: false
				}),
				rootVisible: false,
				columns: [
					{
						header: CMDBuild.Translation.management.modcard.relation_columns.domain,
						sortable: false,
						dataIndex: 'dom_id',
						hidden: true
					},
					{
						header: CMDBuild.Translation.management.modcard.relation_columns.destclass,
						flex: 2,
						sortable: false,
						dataIndex: 'label',
						xtype: 'treecolumn'
					},
					{
						header: CMDBuild.Translation.management.modcard.relation_columns.begin_date,
						flex: 1,
						sortable: false,
						dataIndex: 'rel_date'
					},
					{
						header: CMDBuild.Translation.management.modcard.relation_columns.code,
						flex: 1,
						sortable: false,
						dataIndex: 'dst_code'
					},
					{
						header: CMDBuild.Translation.management.modcard.relation_columns.description,
						flex: 2,
						sortable: false,
						dataIndex: 'dst_desc'
					},
					this.attrsColumn,
					{
						header: '&nbsp',
						fixed: true,
						sortable: false,
						renderer: Ext.bind(this.renderRelationActions, this),
						align: 'center',
						tdCls: 'grid-button',
						dataIndex: 'Fake',
						menuDisabled: true,
						hideable: false
					}
				]
			});

			this.callParent(arguments);

			this.CMEVENTS = {
				addButtonClick: "cm-add-relation-click",
				domainNodeAppended: "cm-domain-node-appended",
				openGraphClick: "cm-open-graph"
			};

			this.addEvents(this.CMEVENTS.addButtonClick);
			this.addEvents(this.CMEVENTS.domainNodeAppended);
			this.addEvents(this.CMEVENTS.openGraphClick);
		},

		listeners: {
			show: function(panel, eOpts) {
				// History record save
				if (!Ext.isEmpty(_CMWFState.getProcessClassRef()) && !Ext.isEmpty( _CMWFState.getProcessInstance()))
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: 'workflow',
						entryType: {
							description: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessClassRef()
						},
						item: {
							description: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessInstance()
						},
						section: {
							description: this.title,
							object: this
						}
					});
			}
		},

		buildTBar: function() {
			var me = this;

			this.tbar = [];

			if (CMDBuild.configuration.graph.get(CMDBuild.core.constants.Proxy.ENABLED)) {
				this.graphButton = Ext.create('CMDBuild.core.buttons.iconized.RelationGraph', {
					scope: this,

					handler: function(button, e) {
						this.fireEvent(this.CMEVENTS.openGraphClick);
					}
				});

				this.tbar.push(this.graphButton);
			} else {
				this.graphButton = nullButton;
			}
		},

		clearStore: function() {
			this.store.getRootNode().removeAll();
		},

		fillWithData: function(domains) {
			this.showAttributesColumn = false;

			domains = domains || [];
			var nodes = [],
				r = this.store.getRootNode();

			for (var i=0, l=domains.length; i<l; ++i) {
				var domainResponseObj = domains[i],
					domainCachedData = _CMCache.getDomainById(domainResponseObj.id);

				if (domainCachedData) {
					nodes.push(buildNodeForDomain.call(this, domainResponseObj, domainCachedData));
				} else {
					CMDBuild.log.error("I have not cached data for domain", domainResponseObj.id);
				}
			}

			r.removeAll();
			if (nodes.length > 0) {
				r.appendChild(nodes);
			}

			if (this.showAttributesColumn) {
				this.attrsColumn.show();
			} else {
				this.attrsColumn.hide();
			}
		},

		convertRelationInNodes: convertRelationInNodes,
		renderRelationActions: renderRelationActions,

		/**
		 * @deprecated
		 */
		onAddCardButtonClick: function() {
			_deprecated('onAddCardButtonClick', this);

			this.disable();
		},

		/**
		 * @deprecated
		 */
		onClassSelected: function() {
			_deprecated('onClassSelected', this);
		}
	});

	function buildNodeForDomain(domainResponseObj, domainCachedData) {
		var children = [],
			attributes = domainCachedData.data.attributes || [],
			attributesToString = "<span class=\"cm-bold\">",
			oversize = domainResponseObj.relations_size > CMDBuild.configuration.instance.get('relationLimit'), // TODO: use proxy constants
			src = domainResponseObj.src,
			domId = domainCachedData.get("id"),
			node = {
				dom_id: domId,
				label: buildDescriptionForDomainNode(domainResponseObj, domainCachedData),

				src: src,
				relations_size: domainResponseObj.relations_size,

				expanded: !oversize,
				leaf: false,
				children: [],
				rel_attr_keys: []
			};

		if (attributes.length > 0) {
			this.showAttributesColumn = true;

			for (var i=0, l=attributes.length; i<l; i++) {
				var attr = attributes[i];
				if (attr.fieldmode == "hidden") {
					continue;
				}

				node.rel_attr_keys.push(attr.name);

				attributesToString += i==0 ? "" : " | ";
				attributesToString += attr.description || attr.name;
			}

			node.rel_attr = attributesToString + "</span>";
		}

		if (oversize) {
			// it is asynchronous, add an empty obj to get the possibility to expand the tree widget
			node.children.push({});
		} else {
			node.children = convertRelationInNodes(domainResponseObj.relations, domId, src, node);
		}

		return node;
	}

	function convertRelationInNodes(relations, dom_id, src, node, nodeUI) {
		relations = relations || [];
		var r,c,i=0,
			l=relations.length,
			nodes = [],
			attributesToString = "",
			key,
			val;

		for (; i<l; ++i) {
			r = relations[i];
			c = _CMCache.getEntryTypeById(r.dst_cid);

			if (!c) {
				continue;
			}

			r.leaf = true;
			r.label = c.get("text");
			r.dom_id = dom_id;
			r.src = src;

			attributesToString = "";
			node.rel_attr_keys = node.rel_attr_keys || nodeUI.raw.rel_attr_keys || [];
			for (var j=0; j<node.rel_attr_keys.length; ++j) {
				key = node.rel_attr_keys[j];
				val = r.rel_attr[key];
				if (typeof val == "undefined") {
					val = " - "; // is not used the || operator because 0 and false are valid values for val
				}

				attributesToString += j==0 ? "" : " | ";
				attributesToString += val.dsc || val;
			}
			r.attr_as_obj = r.rel_attr; // used in modify window
			r.rel_attr = attributesToString;
			nodes.push(r);
			if (nodeUI) {
				nodeUI.appendChild(r);
			}
		}

		return nodes;
	}

	/**
	 * @param (Object) value
	 * @param (Object) metadata
	 * @param (Object) record
	 *
	 * @return (String) actionsHtml - Empty if there aren't icons to render
	 *
	 * TODO: fix ugly code
	 */
	function renderRelationActions(value, metadata, record) {
		// The domain node has no icons to render
		if (record.get('depth') == 1)
			return '';

		var tr = CMDBuild.Translation.management.modcard;
		var actionsHtml = '<img style="cursor:pointer" title="' + CMDBuild.Translation.management.modcard.open_relation + '" class="action-relation-go" src="images/icons/bullet_go.png"/>';
		var tableId = record.get("dst_cid");
		var table = _CMCache.getClassById(tableId);
		var entryType = _CMCache.getEntryTypeById(tableId);
		var privileges =  _CMUtils.getEntryTypePrivileges(entryType);

		if (table && table.get('priv_write') && ! privileges.crudDisabled.modify) {
			actionsHtml += '<img style="cursor:pointer" title="' + CMDBuild.Translation.management.modcard.modify_card + '" class="action-relation-editcard" src="images/icons/modify.png"/>';
		} else {
			actionsHtml += '<img style="cursor:pointer" title="' + CMDBuild.Translation.management.modcard.view_relation + '" class="action-relation-viewcard" src="images/icons/zoom.png"/>';
		}

		if (CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED))
			actionsHtml += '<img style="cursor:pointer" title="' + CMDBuild.Translation.management.modcard.showattach + '" class="action-relation-attach" src="images/icons/attach.png"/>';

		return actionsHtml;
	}

	function buildDescriptionForDomainNode(domainResponseObj, domainCachedData) {
		var prefix = domainCachedData.get("descr"+domainResponseObj.src),
			s = domainResponseObj.relations_size,
			postfix = s  > 1 ? CMDBuild.Translation.management.modcard.relation_columns.items : CMDBuild.Translation.management.modcard.relation_columns.item;

		return "<span class=\"cm-bold\">" + prefix + " ("+ s + " " + postfix + ")</span>" ;
	}

})();
