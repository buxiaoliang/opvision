(function () {

	Ext.define('CMDBuild.core.fieldManager.builders.text.HtmlEditor', {
		extend: 'CMDBuild.core.fieldManager.builders.Abstract',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
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
				editor: parameters.withEditor ? this.buildEditor() : null,
				hidden: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.SHOW_COLUMN),
				renderer: this.rendererColumn,
				scope: this,
				sortable: true,
				text: this.applyMandatoryLabelFlag(this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION))
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.HtmlEditor}
		 */
		buildEditor: function () {
			return this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN) ? {} : Ext.create('CMDBuild.view.common.field.HtmlEditor', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				minWidth: CMDBuild.core.constants.FieldWidths.EDITOR_HTML,
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE)
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.HtmlEditor}
		 */
		buildField: function () {
			return Ext.create('CMDBuild.view.common.field.HtmlEditor', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				minWidth: CMDBuild.core.constants.FieldWidths.EDITOR_HTML,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE)
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.display.Text}
		 */
		buildFieldReadOnly: function () {
			return Ext.create('CMDBuild.view.common.field.display.Text', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.EDITOR_HTML,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
			});
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
			return Ext.util.Format.stripTags(this.callParent(arguments));
		}
	});

})();
