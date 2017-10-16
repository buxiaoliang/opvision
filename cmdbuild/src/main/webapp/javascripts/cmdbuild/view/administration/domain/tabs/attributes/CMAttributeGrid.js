(function() {

	/**
	 * This class have some custom code different from linked ones
	 *
	 * @link CMDBuild.view.administration.classes.tabs.attributes.CMAttributeGrid
	 * @link CMDBuild.view.administration.workflow.CMAttributeGrid
	 */

	Ext.require('CMDBuild.proxy.common.tabs.attribute.Attribute');

	var ATTRIBUTES = {
		INDEX: CMDBuild.core.constants.Proxy.INDEX,
		NAME: CMDBuild.core.constants.Proxy.NAME,
		DESCRIPTION: CMDBuild.core.constants.Proxy.DESCRIPTION,
		TYPE: CMDBuild.core.constants.Proxy.TYPE,
		IS_BASEDSP: 'isbasedsp',
		IS_UNIQUE: 'isunique',
		IS_NOT_NULL: 'isnotnull',
		IS_INHERITED: 'inherited',
		IS_ACTIVE: CMDBuild.core.constants.Proxy.ACTIVE,
		FIELD_MODE: CMDBuild.core.constants.Proxy.FIELD_MODE,
		GROUP: CMDBuild.core.constants.Proxy.GROUP,
		ABSOLUTE_CLASS_ORDER: 'absoluteClassOrder',
		CLASS_ORDER_SIGN: 'classOrderSign',
		EDITOR_TYPE: CMDBuild.core.constants.Proxy.EDITOR_TYPE
	};
	var REQUEST = {
		ROOT: 'attributes'
	};
	var ATTR_TO_SKIP = 'Notes';

	var translation = CMDBuild.Translation.administration.modClass.attributeProperties;

	Ext.define("CMDBuild.view.administration.domain.tabs.attributes.CMAttributeGrid", {
		extend: 'Ext.grid.Panel',

		cls: 'cmdb-border-bottom',
		remoteSort: false,
		includeInherited: true,
		eventtype: 'class',

		hideNotNull: false, // for processes

		hideMode: 'offsets',
		border: false,

		constructor: function() {
			this.addAttributeButton = new Ext.button.Button({
				iconCls: 'add',
				text: translation.add_attribute
			});

			this.orderButton = new Ext.button.Button({
				iconCls: 'order',
				text: translation.set_sorting_criteria
			});

			this.inheriteFlag = new Ext.form.Checkbox({
				boxLabel: CMDBuild.Translation.administration.modClass.include_inherited,
				boxLabelCls: 'cmdb-toolbar-item',
				checked: true,
				scope: this,
				handler: function(obj, checked) {
					this.setIncludeInheritedAndFilter(includeInherited = checked);
				}
			});

			this.buildStore();
			this.buildColumnConf();
			this.buildTBar();

			this.callParent(arguments);
		},

		initComponent: function() {
			Ext.apply(this, {
				viewConfig: {
					loadMask: false,
					plugins: {
						ptype: 'gridviewdragdrop',
						dragGroup: 'dd',
						dropGroup: 'dd'
					},
					listeners: {
						scope: this,
						beforedrop: function() {
							// it is not allowed to reorder the attribute if there are also the inherited attrs
							return this.inheriteFlag.checked;
						},
						drop: function(node, data, dropRec, dropPosition) {
							this.fireEvent('cm_attribute_moved', arguments);
						}
					}
				}
			});

			this.callParent(arguments);

			this.getStore().on('load', function(store, records, opt) {
				this.filterInheritedAndNotes();
			}, this);
		},

		buildColumnConf: function() {
			this.columns = [{
				header: translation.name,
				dataIndex: ATTRIBUTES.NAME,
				flex: 1
			}, {
				header: translation.description,
				dataIndex: ATTRIBUTES.DESCRIPTION,
				flex: 1
			}, {
				header: translation.type,
				dataIndex: ATTRIBUTES.TYPE,
				flex: 1
			},
			new Ext.ux.CheckColumn( {
				header: translation.isbasedsp,
				dataIndex: ATTRIBUTES.IS_BASEDSP,
				cmReadOnly: true
			}),
			new Ext.ux.CheckColumn( {
				header: translation.isunique,
				dataIndex: ATTRIBUTES.IS_UNIQUE,
				cmReadOnly: true
			}),
			new Ext.ux.CheckColumn( {
				header: translation.isnotnull,
				dataIndex: ATTRIBUTES.IS_NOT_NULL,
				cmReadOnly: true
			}),
			new Ext.ux.CheckColumn( {
				header: translation.isactive,
				dataIndex: ATTRIBUTES.IS_ACTIVE,
				cmReadOnly: true
			}), {
				header: translation.field_visibility,
				dataIndex: ATTRIBUTES.FIELD_MODE,
				renderer: renderEditingMode
			}];
		},

		buildStore: function() {
			this.store = Ext.create('Ext.data.ArrayStore', {
				fields: [
					CMDBuild.core.constants.Proxy.INDEX,
					CMDBuild.core.constants.Proxy.NAME,
					CMDBuild.core.constants.Proxy.DESCRIPTION,
					CMDBuild.core.constants.Proxy.TYPE,
					'isunique',
					'isbasedsp',
					'isnotnull',
					"inherited",
					CMDBuild.core.constants.Proxy.FIELD_MODE,
					CMDBuild.core.constants.Proxy.ACTIVE,
					CMDBuild.core.constants.Proxy.GROUP
				],
				data: [],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.INDEX, direction: "ASC" }
				]
			});
		},

		buildTBar: function() {
			this.tbar = [this.addAttributeButton];
		},

		onClassSelected: function(idClass) {
			this.refreshStore(idClass, idAttributeToSelectAfter = null);
		},

		onDomainSelected: function(domain) { // Probably not used
			this.refreshStore(domain, indexAttributeToSelectAfter = null);
		},

		refreshStore: function (indexAttributeToSelectAfter) {
			if (!this.delegate.cmfg('domainSelectedDomainIsEmpty')) {
				if (Ext.isEmpty(this.delegate.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ATTRIBUTES))) {
					this.store.removeAll();
				} else {
					this.store.loadData(this.delegate.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ATTRIBUTES));
				}

				this.selectRecordAtIndexOrTheFirst(indexAttributeToSelectAfter);
			}
		},

		setIncludeInheritedAndFilter: function(includeInherited) {
			this.includeInherited = includeInherited;
			this.filterInheritedAndNotes();
		},

		filterInheritedAndNotes: function() {
			var inh = this.includeInherited;

			this.getStore().filterBy(function(record) {
				return (record.get(ATTR.NAME) != ATTR_TO_SKIP) && (inh || !record.get(ATTR.IS_INHERITED));
			});
		},

		selectFirstRow: function() {
			var _this = this;

			Ext.Function.defer(function() {
				if (_this.store.getCount() > 0 && _this.isVisible()) {
					var sm = _this.getSelectionModel();

					if (!sm.hasSelection())
						sm.select(0);
				}
			}, 200);
		},

		selectRecordAtIndexOrTheFirst: function(indexAttributeToSelectAfter) {
			if (indexAttributeToSelectAfter) {
				var recordIndex = this.store.findRecord(CMDBuild.core.constants.Proxy.INDEX, indexAttributeToSelectAfter);

				if (recordIndex)
					this.getSelectionModel().select(recordIndex);
			} else {
				try {
					if (this.store.count() != 0)
						this.getSelectionModel().select(0);
				} catch (e) {
					// fail if the grid is not rendered
				}
			}
		},

		onAddAttributeClick: function() {
			this.getSelectionModel().deselectAll();
		},

		selectAttributeByName: function(name) {
			var sm = this.getSelectionModel();
			var r = this.store.findRecord("name", name);
			if (r) {
				sm.select(r);
			} else if (this.store.count() != 0) {
				sm.select(0);
			}
		}

	});

	function renderEditingMode(val) {
		return translation["field_" + val];
	}

})();