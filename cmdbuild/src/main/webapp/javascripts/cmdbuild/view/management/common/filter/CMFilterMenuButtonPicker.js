(function(){
	/**
	 * @deprecated CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced
	 */

	// Constants to identify the icons that the user
	// could click, and call the right callback
	var ACTION_CSS_CLASS = {
		saveFilter: "action-filter-save",
		modifyFilter: "action-filter-modify",
		removeFilter: "action-filter-remove",
		cloneFilter: "action-filter-clone"
	};

	var FILTER_BUTTON_LABEL = CMDBuild.Translation.searchFilter;
	var CLEAR_FILTER_BUTTON_LABEL = CMDBuild.Translation.clearFilter;

	var TOOLTIP = {
		save: CMDBuild.Translation.save,
		modify: CMDBuild.Translation.modify,
		clone: CMDBuild.Translation.clone,
		remove: CMDBuild.Translation.remove
	};

	var ICONS_PATH = {
		save: "images/icons/disk.png",
		save_disabled: "images/icons/disk_disabled.png",
		modify: "images/icons/modify.png",
		clone: "images/icons/clone.png",
		remove: "images/icons/cross.png"
	};
	
	
	var operator = CMDBuild.WidgetBuilders.BaseAttribute.FilterOperator;
	var CONDITION_TRANSLATION_MAP = {};
	CONDITION_TRANSLATION_MAP[operator.EQUAL] = CMDBuild.Translation.equals;
	CONDITION_TRANSLATION_MAP[operator.NOT_EQUAL] = CMDBuild.Translation.different;
	CONDITION_TRANSLATION_MAP[operator.NULL] = CMDBuild.Translation.isNull;
	CONDITION_TRANSLATION_MAP[operator.NOT_NULL] = CMDBuild.Translation.isNotNull;
	CONDITION_TRANSLATION_MAP[operator.GREATER_THAN] = CMDBuild.Translation.greaterThan;
	CONDITION_TRANSLATION_MAP[operator.LESS_THAN] = CMDBuild.Translation.lessThan;
	CONDITION_TRANSLATION_MAP[operator.BETWEEN] = CMDBuild.Translation.between;
	CONDITION_TRANSLATION_MAP[operator.CONTAIN] = CMDBuild.Translation.contains;
	CONDITION_TRANSLATION_MAP[operator.NOT_CONTAIN] = CMDBuild.Translation.doesNotContain;
	CONDITION_TRANSLATION_MAP[operator.BEGIN] = CMDBuild.Translation.beginsWith;
	CONDITION_TRANSLATION_MAP[operator.NOT_BEGIN] = CMDBuild.Translation.doesNotBeginWith;
	CONDITION_TRANSLATION_MAP[operator.END] = CMDBuild.Translation.endsWith;
	CONDITION_TRANSLATION_MAP[operator.NOT_END] = CMDBuild.Translation.doesNotEndWith;


	var TEXT_FIELD_HEIGHT = 80;
	var HTML_FIELD_HEIGHT = 200;
	var SIMPLE_FIELD_HEIGHT = 50;

	function getRuntimeParameterWindowItems(fields) {
		var items = [];
		for (var i=0, l=fields.length; i<l; ++i) {
			var field = fields[i];
			items.push(new CMDBuild.view.management.common.filter.CMRuntimeParameterWindowField({
				valueField: field
			}));
		}

		return items;
	}

	function calculateWindowHeight(fields) {
		var height = 80;

		for (var i=0; i<fields.length; ++i) {
			var field = fields[i];
			var fieldClassName = Ext.getClassName(field);

			if (fieldClassName == "Ext.form.field.TextArea") {
				height += TEXT_FIELD_HEIGHT;
			} else if (fieldClassName == "CMDBuild.view.common.field.HtmlEditor") {
				height += HTML_FIELD_HEIGHT;
			} else {
				height += SIMPLE_FIELD_HEIGHT;
			}
		}

		return height;
	}

	function showPicker(me, button, state) {
		if (me.picker == null) {
			me.picker = new CMDBuild.view.management.common.filter.CMFilterMenuButtonPicker({
				onStoreDidLoad: function() {
					_showPicker(me, state);
				},
				entryType: me.entryType,
				listeners: {
					beforeitemclick: function beforeitemclick(grid, model, htmlelement, rowIndex, event, opt) {
						var cssClassName = event.target.className;
						var callBacks = {};

						callBacks[ACTION_CSS_CLASS.saveFilter] = "onFilterMenuButtonSaveActionClick";
						callBacks[ACTION_CSS_CLASS.modifyFilter] = "onFilterMenuButtonModifyActionClick";
						callBacks[ACTION_CSS_CLASS.removeFilter] = "onFilterMenuButtonRemoveActionClick";
						callBacks[ACTION_CSS_CLASS.cloneFilter] = "onFilterMenuButtonCloneActionClick";

						if (typeof callBacks[cssClassName] == "string") {
							me.callDelegates(callBacks[cssClassName], [me, model.copy()]);
							me.deselectPicker();
						} else {
							// the row was selected
							me.callDelegates("onFilterMenuButtonApplyActionClick", [me, model.copy()]);
						}
					},

					addFilter: function() {
						me.callDelegates("onFilterMenuButtonNewActionClick", me);
					},

					show: function onFilterPickerShow(picker) {
						var windowSize = Ext.getBody().getViewSize();
						var pickerBox = picker.getBox();
						var buttonBox = me.getBox();

						if (windowSize && pickerBox && buttonBox) {
							if (pickerBox.bottom > windowSize.height) {
								// the bottom border of the picker is under
								// the bottom border of the window

								var delta = pickerBox.height + buttonBox.height;
								picker.setPosition(pickerBox.x, pickerBox.y - delta);
							}
						}
					}
				}
			});
		} else {
			_showPicker(me, state);
		}
	}

	function _showPicker(me, state) {
		if (state) {
			me.updatePickerPosition();
			if (me.picker.filtersCount()) {
				me.selectAppliedFilter();
				me.picker.show();
			} else {
				// If has no filters the user
				// can only add a new filter.
				me.callDelegates("onFilterMenuButtonNewActionClick", me);
				me.showListButton.toggle();
			}
		} else {
			me.picker.hide();
		}
	}
	
	
	/*
	 * This component is shown when toggle the main button of the CMFilterMenuButton
	 * Probably could be better to use a floating panel instead a window
	 */
	Ext.define("CMDBuild.view.management.common.filter.CMFilterMenuButtonPicker", {

		extend: "Ext.window.Window",

		// configuration
		entryType: null,
		onStoreDidLoad: Ext.emptyFn, // callBack to call after the store load
		// configuration

		baseCls: "", // To remove the blue rounded border of the ExtJS window style

		initComponent: function() {
			this.closable = false;
			this.draggable = false;
			this.resizable = false;
			this.frame = true;
			this.border = false;
			this.rowTemplate = '<p class="filterMenuButtonGrid-name" title="{0} - {1}">{1}</p>';

			this.cls = "filterMenuButtonGrid";

			var me = this;
			var store = CMDBuild.proxy.Filter.newUserStore();

			this.grid = new Ext.grid.Panel({
				width: 300,
				maxHeight: 200, // TODO calculate it
				autoScroll: true,
				hideHeaders: true,
				store: store,
				tbar: [{
					text: CMDBuild.Translation.add,
					iconCls: "add",
					handler: function() {
						me.fireEvent("addFilter");
					}
				}],
				columns: [{
					renderer: function(value, metadata, record, rowIndex, colIndex, store, view) {
						var description = Ext.String.ellipsis(record.getDescription(), 50);
						var name = Ext.String.ellipsis(record.getName(), 45);
						if (record.dirty) {
							name += "*";
						}
						var s = (Ext.String.trim(description) == "") ? name : description;
						return Ext.String.format(me.rowTemplate, name, s);
					},
					flex: 1,
					menuDisabled: true,
					hideable: false
				}, {
					width: 100,
					fixed: true,
					sortable: false,
					renderer: function(value, metadata, record, rowIndex, colIndex, store, view) {
						if (record.isTemplate()) {
							return "";
						}

						var template = '<img style="cursor:pointer" title="{0}" class="{1}" src="{2}"/>';
						var saveIcon = record.dirty ? ICONS_PATH.save : ICONS_PATH.save_disabled;
						return Ext.String.format(template, TOOLTIP.save, ACTION_CSS_CLASS.saveFilter, saveIcon) +
							Ext.String.format(template, TOOLTIP.modify, ACTION_CSS_CLASS.modifyFilter, ICONS_PATH.modify) +
							Ext.String.format(template, TOOLTIP.clone, ACTION_CSS_CLASS.cloneFilter, ICONS_PATH.clone) +
							Ext.String.format(template, TOOLTIP.remove, ACTION_CSS_CLASS.removeFilter, ICONS_PATH.remove);
					},
					align: 'center',
					menuDisabled: true,
					hideable: false
				}]
			});

			this.relayEvents(this.grid, ['beforeitemclick', 'select']);
			this.items = [this.grid];

			this.callParent(arguments);

			this.load();
		},

		filtersCount: function() {
			return this.grid.getStore().count();
		},

		deselect: function() {
			this.grid.getSelectionModel().deselectAll();
		},

		selectAppliedFilter: function() {
			this.deselect();
			var appliedFilter = this.grid.getStore().findRecord("applied", true);
			if (appliedFilter != null) {
				this.grid.getSelectionModel().select(appliedFilter);
			}
		},

		getStore: function() {
			return this.grid.getStore();
		},

		load: function() {
			var me = this;
			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = me.entryType.getName();
			me.getStore().load({
				callback: me.onStoreDidLoad,
				params: params
			});
		}
	});
})();