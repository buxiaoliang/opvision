(function () {

	/**
	 * Specific field attributes:
	 * 		- {Array} values: list values
	 */
	Ext.define('CMDBuild.core.fieldManager.builders.List', {
		extend: 'CMDBuild.core.fieldManager.builders.Abstract',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.core.fieldManager.builders.List'
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
		 * @returns {Object}
		 */
		buildEditor: function () {
			return this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN) ? {} : Ext.create('CMDBuild.view.common.field.comboBox.Erasable', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				attributeModel: this.cmfg('fieldManagerAttributeModelGet'),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				plugins: new CMDBuild.SetValueOnLoadPlugin(),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				valueField: CMDBuild.core.constants.Proxy.ID,

				store: this.buildFieldStore(),
				queryMode: 'local'
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.comboBox.Erasable}
		 */
		buildField: function () {
			return Ext.create('CMDBuild.view.common.field.comboBox.Erasable', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				attributeModel: this.cmfg('fieldManagerAttributeModelGet'),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				plugins: new CMDBuild.SetValueOnLoadPlugin(),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				valueField: CMDBuild.core.constants.Proxy.ID,

				store: this.buildFieldStore(),
				queryMode: 'local'
			});
		},

		/**
		 * @returns {Ext.data.ArrayStore}
		 *
		 * @private
		 */
		buildFieldStore: function () {
			return CMDBuild.proxy.core.fieldManager.builders.List.getStore(
				this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.VALUES)
			);
		}
	});

})();
