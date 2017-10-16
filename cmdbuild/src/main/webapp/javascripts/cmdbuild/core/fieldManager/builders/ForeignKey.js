(function () {

	/**
	 * Specific field attributes:
	 * 		- {String} filter: filter to apply
	 * 		- {String} targetClass: target class name
	 */
	Ext.define('CMDBuild.core.fieldManager.builders.ForeignKey', {
		extend: 'CMDBuild.core.fieldManager.builders.Abstract',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.core.fieldManager.builders.ForeignKey'
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
			return this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN) ? {} : Ext.create('CMDBuild.view.common.field.comboBox.Searchable', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				attributeModel: this.cmfg('fieldManagerAttributeModelGet'),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				displayField: 'Description',
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				plugins: new CMDBuild.SetValueOnLoadPlugin(),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				valueField: 'Id',

				store: this.buildFieldStore(),
				queryMode: 'local',

				templateResolver: this.cmfg('fieldManagerTemplateResolverBuild', [CMDBuild.core.constants.Proxy.FILTER]),
				resolveTemplates: this.cmfg('fieldManagerTemplateResolverResolveFunctionGet'),
				listeners: {
					scope: this,
					added: function (field, container, pos, eOpts) {
						field.resolveTemplates();
					},
			                specialkey: function(field, e){
			                    if (e.getKey() == e.TAB) {
			                       return false;
			                    }
			                }
			 	}
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.comboBox.Searchable}
		 */
		buildField: function () {
			return Ext.create('CMDBuild.view.common.field.comboBox.Searchable', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				attributeModel: this.cmfg('fieldManagerAttributeModelGet'),
				disabled: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				displayField: 'Description',
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				plugins: new CMDBuild.SetValueOnLoadPlugin(),
				readOnly: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE),
				valueField: 'Id',

				store: this.buildFieldStore(),
				queryMode: 'local',

				templateResolver: this.cmfg('fieldManagerTemplateResolverBuild', [CMDBuild.core.constants.Proxy.FILTER]),
				resolveTemplates: this.cmfg('fieldManagerTemplateResolverResolveFunctionGet'),

				listeners: {
					scope: this,
					added: function (field, container, pos, eOpts) {
						field.resolveTemplates();
					}
				}
			});
		},

		/**
		 * @returns {CMDBuild.view.common.field.display.Reference}
		 */
		buildFieldReadOnly: function () {
			return Ext.create('CMDBuild.view.common.field.display.Reference', {
				allowBlank: !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.MANDATORY),
				fieldLabel: this.applyMandatoryLabelFlag(
					this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					|| this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME)
				),
				hidden: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.HIDDEN),
				labelAlign: 'right',
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.NAME),
				targetClassName: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.TARGET_CLASS)
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 *
		 * @private
		 */
		buildFieldStore: function () {
			var extraParams = {};
			extraParams[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.TARGET_CLASS);

			if (!this.cmfg('fieldManagerAttributeModelIsEmpty', CMDBuild.core.constants.Proxy.FILTER))
				extraParams[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode({ CQL: this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.FILTER) });

			return CMDBuild.proxy.core.fieldManager.builders.ForeignKey.getStore({ extraParams: extraParams });
		}
	});

})();
