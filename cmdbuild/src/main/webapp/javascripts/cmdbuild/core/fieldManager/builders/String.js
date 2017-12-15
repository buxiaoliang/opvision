(function () {

	/**
	 * Specific field attributes:
	 * 		- {Number} length: max number digits
	 */
	Ext.define('CMDBuild.core.fieldManager.builders.String', {
		extend: 'CMDBuild.core.fieldManager.builders.Abstract',

		uses: [
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
		 * @returns {Object}
		 */
		buildEditor: function () {
			return this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN) ? {} : {
				xtype: 'textfield',
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				enforceMaxLength: true,
				maxLength: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.LENGTH),
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),

				listeners: {
			                specialkey: function(field, e){
			                    if (e.getKey() == e.TAB) {
			                       return false;
			                    }
			                }
			 	}
			};
		},

		/**
		 * @returns {Ext.form.field.Text}
		 */
		buildField: function () {
			return Ext.create('Ext.form.field.Text', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				enforceMaxLength: true,
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxLength: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.LENGTH),
				maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				width: this.calculateWidth(),
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE)
			});
		},
		
		calculateWidth : function() {
			var length = this.cmfg('fieldManagerAttributeWidthGet', "len");
			var d = this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION);
			length = (length * 13) + 12; // arbitrary choice
			if (length > CMDBuild.core.constants.FieldWidths.STANDARD_BIG_FIELD_ONLY) {
					length = CMDBuild.core.constants.FieldWidths.STANDARD_BIG_FIELD_ONLY;
			} 
			var width = CMDBuild.core.constants.FieldWidths.LABEL + length;
			return width;
		}
	});
})();
