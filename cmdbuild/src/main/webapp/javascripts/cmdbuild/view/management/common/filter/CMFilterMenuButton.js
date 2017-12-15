(function() {

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
	
	
	Ext.define("CMDBuild.view.management.common.filter.CMFilterMenuButton", {
		extend: "Ext.container.ButtonGroup",

		mixins: {
			delegable: "CMDBuild.core.CMDelegable"
		},

		constructor: function() {
			this.mixins.delegable.constructor.call(this,
					"CMDBuild.delegate.common.filter.CMFilterMenuButtonDelegate");

			this.callParent(arguments);
		},

		initComponent: function() {
			this.picker = null;

			var me = this;

			this.showListButton = new Ext.button.Button({
				text: FILTER_BUTTON_LABEL,
				iconCls: 'searchFilter',
				enableToggle: true,
				toggleHandler: function(button, state) {
					return showPicker(me, button, state);
				}
			});

			this.clearButton = new Ext.button.Button({
				text: CLEAR_FILTER_BUTTON_LABEL,
				iconCls: "searchFilterClear",
				disabled: true,
				handler: function() {
					me.callDelegates("onFilterMenuButtonClearActionClick", me);
				}
			});

			this.items = [this.showListButton, this.clearButton];

			this.callParent(arguments);

			this.mon(this, "move", function(button, x, y) {
				this.showListButton.toggle(false);
			}, this);
		},

		/**
		 * Override to avoid full bottongroup container disabled
		 *
		 * @override
		 */
		disable: function() {
			this.clearButton.disable();
			this.showListButton.disable();
		},

		/**
		 * Override to avoid full bottongroup container disabled
		 *
		 * @override
		 */
		enable: function() {
			this.clearButton.enable();
			this.showListButton.enable();
		},

		reconfigureForEntryType: function(entryType) {
			this.entryType = entryType;
			if (this.picker != null) {
				this.picker.destroy();
				this.picker = null;
			}
		},

		updatePickerPosition: function(position) {
			var box = position || this.getBox();
			if (this.picker != null) {
				this.picker.setPosition(box.x + 5, (box.y + box.height));
			}
		},

		setFilterButtonLabel: function(label) {
			var text = FILTER_BUTTON_LABEL;
			var tooltip = FILTER_BUTTON_LABEL;
			if (label) {
				text = Ext.String.ellipsis(label, 20);
				tooltip = label;
			}

			this.showListButton.setTooltip(tooltip);
			this.showListButton.setText(text);
		},

		deselectPicker: function() {
			this.picker.deselect();
		},

		load: function() {
			this.picker.load();
		},

		selectAppliedFilter: function() {
			this.picker.selectAppliedFilter();
		},

		enableClearFilterButton: function() {
			this.clearButton.enable();
		},

		disableClearFilterButton: function() {
			this.clearButton.disable();
		},

		getFilterStore: function() {
			var store = null;
			if (this.picker) {
				store = this.picker.getStore();
			}

			return store;
		}
	});

})();