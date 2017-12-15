(function () {

	Ext.define('CMDBuild.view.common.panel.module.attachment.window.add.ContainerFieldsCommon', {
		extend: 'Ext.container.Container',

		uses: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.common.panel.module.attachment.Attachment'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.window.Add}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		fieldComboCategory: undefined,

		border: false,
		cls: 'cmdb-blue-panel',
		frame: false,
		width: 500,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.fieldComboCategory = Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.CATEGORY,
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.category),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						width: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						valueField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						allowBlank: false,
						forceSelection: true,
						editable: false,

						store: CMDBuild.proxy.common.panel.module.attachment.Attachment.getStoreLokup(),
						queryMode: 'local',

						listeners: {
							scope: this,
							change: function (field, newValue, oldValue, eOpts) {
								if (Ext.isString(newValue) && !Ext.isEmpty(newValue))
									this.delegate.cmfg('onPanelModuleAttachmentWindowAddCategoryChange', newValue);
							}
						}
					}),
					Ext.create('Ext.form.field.File', {
						name: CMDBuild.core.constants.Proxy.FILE,
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.loadAttachment),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
						allowBlank: false
					}),
					Ext.create('Ext.form.field.TextArea', {
						name: CMDBuild.core.constants.Proxy.DESCRIPTION,
						fieldLabel: CMDBuild.core.Utils.prependMandatoryLabel(CMDBuild.Translation.descriptionLabel),
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
						allowBlank: false
					}),
					Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.MAJOR,
						fieldLabel: CMDBuild.Translation.majorVersion,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						labelAlign: 'right',
						inputValue: true,
						uncheckedValue: false,
						disabled: true,
						value: true
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
