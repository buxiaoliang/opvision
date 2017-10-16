(function () {

	Ext.define('CMDBuild.core.fieldManager.builders.Boolean', {
		extend: 'CMDBuild.core.fieldManager.builders.Abstract',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {CMDBuild.core.fieldManager.FieldManager}
		 */
		parentDelegate: undefined,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Ext.grid.column.Column or Object}
		 */
		buildColumn: function (parameters) {
			return this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN) ? {} : Ext.create('Ext.grid.column.Column', {
				dataIndex: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				hidden: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.SHOW_COLUMN),
				renderer: this.rendererColumn,
				scope: this,
				sortable: true,
				text: this.applyMandatoryLabelFlag(this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)),
				width: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME).length * 9
			});
		},

		/**
		 * @returns {Ext.form.field.Checkbox}
		 */
		buildField: function () {
			return Ext.create('Ext.form.field.Checkbox', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				inputValue: true,
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				uncheckedValue: false
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.display.Boolean}
		 */
		buildFieldReadOnly: function () {
			return Ext.create('CMDBuild.view.common.field.display.Boolean', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
			});
		},

		/**
		 * @returns {Object}
		 */
		buildStoreField: function () {
			return { name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME), type: 'boolean' };
		},

		/**
		 * @param {Object} value
		 * @param {Object} metadata
		 * @param {Ext.data.Model} record
		 * @param {Number} rowIndex
		 * @param {Number} colIndex
		 * @param {Ext.data.Store} store
		 * @param {Ext.view.View} view
		 *
		 * @returns {String}
		 *
		 * @override
		 */
		rendererColumn: function (value, metadata, record, rowIndex, colIndex, store, view) {
			value = CMDBuild.core.Utils.decodeAsBoolean(value);

			if (Ext.isEmpty(Ext.String.trim(String(value))) && this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY))
				metadata.tdCls += ' x-grid-invalid-cell-error';

			return value ? CMDBuild.Translation.yes : CMDBuild.Translation.no; // Translate value
		}
	});

})();
