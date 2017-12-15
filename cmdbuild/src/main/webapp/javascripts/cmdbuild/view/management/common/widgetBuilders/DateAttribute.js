(function() {
	var TYPE_FIXED = 'fixed';
	var TYPE_EXPRESSION = 'expression';

	/**
	 * @class CMDBuild.WidgetBuilders.DateAttribute
	 * @extends CMDBuild.WidgetBuilders.RangeQueryAttribute
	 */
	Ext.ns("CMDBuild.WidgetBuilders");
	CMDBuild.WidgetBuilders.DateAttribute = function() {
		this.format = 'd/m/Y';
		this.fieldWidth = 100;
		this.headerWidth = 60;
	};
	CMDBuild.extend(CMDBuild.WidgetBuilders.DateAttribute, CMDBuild.WidgetBuilders.RangeQueryAttribute);
	/**
	 * @override
	 * @return object
	 */
	CMDBuild.WidgetBuilders.DateAttribute.prototype.buildGridHeader = function(attribute) {
		return {
			header: attribute.description,
			sortable : true,
			dataIndex : attribute.name,
			hidden: !attribute.isbasedsp,
			flex: this.headerWidth,
			//TODO read the format in the config
			format: this.format
		};
	};
	/**
	 * @override
	 * @return Ext.form.DateField
	 */
	CMDBuild.WidgetBuilders.DateAttribute.prototype.buildAttributeField = function(attribute) {
		return new Ext.form.DateField({
			labelAlign: "right",
			labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
			fieldLabel: attribute.description || attribute.name,
			name: attribute.name,
			allowBlank: !attribute.isnotnull,
			format: this.format, //TODO read the format in the config
			width: CMDBuild.core.constants.FieldWidths.LABEL + this.fieldWidth,
			CMAttribute: attribute
		});
	};

	/**
	 * @override
	 */
	CMDBuild.WidgetBuilders.DateAttribute.prototype.buildFieldsetForFilter = function(field, query, originalField,
			taskManager) {
		var me = this;
		var output;

		// create second date field
		var date_fields = [];
		var field2 = field.cloneConfig();
		field2.hideLabel = true;
		field2.disable();

		date_fields.push(field, field2);

		if (taskManager) {
			output = Ext.create('Ext.container.Container', {
				layout: 'hbox'
			});
			// create type combo
			output.add(this.buildValueTypeCombo());

			// add date fields
			this.date_fields = Ext.create('Ext.container.Container', {
				margins: '0 0 0 5',
				items: date_fields
			});
			output.add(this.date_fields);

			// create text fields for expressions
			var expression_fields = [];
			var exp_field = new Ext.form.TextField({
				name: "expr_" + originalField.name,
				width: 250,
				emptyText: '{function:foo(bar,baz)}',
				submitEmptyText: false
			});
			var exp_field2 = exp_field.cloneConfig();
			exp_field2.hideLabel = true;
			exp_field2.disable();
			expression_fields.push(exp_field, exp_field2);
			// add date fields
			this.expression_fields = Ext.create('Ext.container.Container', {
				margins: '0 0 0 5',
				hidden: true,
				items: expression_fields
			});
			output.add(this.expression_fields);
		} else {
			output = date_fields;
		}

		return this.genericBuildFieldsetForFilter(output, query, originalField, taskManager);
	};

	CMDBuild.WidgetBuilders.DateAttribute.prototype.buildValueTypeCombo = function() {
		var me = this;
		return new Ext.form.ComboBox({
			hideLabel: true,
			name: "filterTypeCombo",
			queryMode: 'local',
			store: new Ext.data.ArrayStore({
				id: 0,
				fields: ['id', 'type'],
				data: [
				       [TYPE_FIXED, CMDBuild.Translation.filterTypeNormal], 
				       [TYPE_EXPRESSION, CMDBuild.Translation.filterTypeExpression] 
				] // data is local
			}),
			value: TYPE_FIXED,
			valueField: 'id',
			displayField: 'type',
			triggerAction: 'all',
			forceSelection: true,
			listeners: {
				change: function(combo, newValue, oldValue, eOpts) {
					me.filterType = newValue;

					if (newValue === TYPE_EXPRESSION) {
						// hide date fields
						me.date_fields.hide();
						me.expression_fields.show();
					} else {
						// hide expression fields
						me.date_fields.show();
						me.expression_fields.hide();
					}
				}
			}
		});
	};

	/**
	 * Create combo select strategy
	 */
	CMDBuild.WidgetBuilders.DateAttribute.prototype.buildOnConditionComboSelectStrategy = function() {
		if (this.taskManager) {
			return new CMDBuild.view.management.common.filter.CMFilterAttributeConditionPanel.TaskDateStrategy(this.valueFields);
		} else {
			return new CMDBuild.view.management.common.filter.CMFilterAttributeConditionPanel.DoubleStrategy(this.valueFields);
		}
	};

	Ext.define("CMDBuild.view.management.common.filter.CMFilterAttributeConditionPanel.TaskDateStrategy", {
		extend: "CMDBuild.view.management.common.filter.CMFilterAttributeConditionPanel.SingleStrategy",

		constructor: function(valueFields) {
			this.callParent(arguments);
		},

		run: function(operator) {
			// disable all fields
			var disableAllFields = this.needsFieldToSetAValue(operator);
			var disableRangeFields = operator !== "between";

			// get fields
			var normal_fields = this.valueFields.items.items[1].items.items;
			var expression_fields = this.valueFields.items.items[2].items.items;

			// enable/disable fields
			normal_fields[0].setDisabled(disableAllFields);
			normal_fields[1].setDisabled(disableAllFields || disableRangeFields);
			expression_fields[0].setDisabled(disableAllFields);
			expression_fields[1].setDisabled(disableAllFields || disableRangeFields);
		}
	});
	
})();