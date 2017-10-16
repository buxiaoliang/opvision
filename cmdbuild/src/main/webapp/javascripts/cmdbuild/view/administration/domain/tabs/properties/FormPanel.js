(function () {

	Ext.define('CMDBuild.view.administration.domain.tabs.properties.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.domain.tabs.Properties'
		],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.administration.domain.tabs.Properties}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		cardinalityCombo: undefined,

		/**
		 * @property {CMDBuild.view.common.field.translatable.Text}
		 */
		domainDescription: undefined,

		/**
		 * @property {Ext.form.field.Checkbox}
		 */
		masterDetailCheckbox: undefined,

		/**
		 * @property {CMDBuild.view.common.field.translatable.Text}
		 */
		masterDetailLabel: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		frame: false,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								text: CMDBuild.Translation.modifyDomain,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDomainModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeDomain,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDomainRemoveButtonClick');
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDomainSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onDomainAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					Ext.create('Ext.form.TextField', {
						name: CMDBuild.core.constants.Proxy.NAME,
						fieldLabel: CMDBuild.Translation.name,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						allowBlank: false,
						disableEnableFunctions: true,
						vtype: 'alphanum',

						enableKeyEvents: true,

						listeners: {
							scope: this,
							change: function (field, newValue, oldValue, eOpts) {
								this.fieldSynch(this.domainDescription, newValue, oldValue);
							}
						}
					}),
					this.domainDescription = Ext.create('CMDBuild.view.common.field.translatable.Text', {
						name: CMDBuild.core.constants.Proxy.DESCRIPTION,
						fieldLabel: CMDBuild.Translation.descriptionLabel,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						allowBlank: false,
						vtype: 'commentextended',

						translationFieldConfig: {
							type: CMDBuild.core.constants.Proxy.DOMAIN,
							identifier: { sourceType: 'form', key: CMDBuild.core.constants.Proxy.NAME, source: this },
							field: CMDBuild.core.constants.Proxy.DESCRIPTION
						}
					}),
					Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID,
						fieldLabel: CMDBuild.Translation.origin,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						valueField: CMDBuild.core.constants.Proxy.ID,
						displayField: CMDBuild.core.constants.Proxy.TEXT,
						allowBlank: false,
						disableEnableFunctions: true,
						forceSelection: true,

						store: CMDBuild.proxy.administration.domain.tabs.Properties.getStoreClasses(),
						queryMode: 'local'
					}),
					Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID,
						fieldLabel: CMDBuild.Translation.destination,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						valueField: CMDBuild.core.constants.Proxy.ID,
						displayField: CMDBuild.core.constants.Proxy.TEXT,
						allowBlank: false,
						disableEnableFunctions: true,
						forceSelection: true,

						store: CMDBuild.proxy.administration.domain.tabs.Properties.getStoreClasses(),
						queryMode: 'local'
					}),
					Ext.create('CMDBuild.view.common.field.translatable.Text', {
						name: CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION,
						fieldLabel: CMDBuild.Translation.directDescription,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						allowBlank: false,
						vtype: 'commentextended',

						translationFieldConfig: {
							type: CMDBuild.core.constants.Proxy.DOMAIN,
							identifier: { sourceType: 'form', key: CMDBuild.core.constants.Proxy.NAME, source: this },
							field: CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION
						}
					}),
					Ext.create('CMDBuild.view.common.field.translatable.Text', {
						name: CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION,
						fieldLabel: CMDBuild.Translation.inverseDescription,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						allowBlank: false,
						vtype: 'commentextended',

						translationFieldConfig: {
							type: CMDBuild.core.constants.Proxy.DOMAIN,
							identifier: { sourceType: 'form', key: CMDBuild.core.constants.Proxy.NAME, source: this },
							field: CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION
						}
					}),
					this.cardinalityCombo = Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.CARDINALITY,
						fieldLabel: CMDBuild.Translation.cardinality,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_SMALL,
						valueField: CMDBuild.core.constants.Proxy.NAME,
						displayField: CMDBuild.core.constants.Proxy.VALUE,
						allowBlank: false,
						disableEnableFunctions: true,
						forceSelection: true,
						editable: false,

						store: CMDBuild.proxy.administration.domain.tabs.Properties.getStoreCardinality(),
						queryMode: 'local',

						listeners: {
							scope: this,
							select:	function (combo, records, eOpts) {
								this.delegate.cmfg('onDomainTabPropertiesCardinalitySelect');
							}
						}
					}),
					this.masterDetailCheckbox = Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL,
						fieldLabel: CMDBuild.Translation.masterDetail,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						inputValue: true,
						uncheckedValue: false,

						listeners: {
							scope: this,
							change: function (field, newValue, oldValue, eOpts) {
								this.delegate.cmfg('onDomainTabPropertiesMasterDetailCheckboxChange');
							}
						}
					}),
					this.masterDetailLabel = Ext.create('CMDBuild.view.common.field.translatable.Text', {
						name: CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL,
						fieldLabel: CMDBuild.Translation.masterDetailLabel,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						hidden: true, // Hidden by default

						translationFieldConfig: {
							type: CMDBuild.core.constants.Proxy.DOMAIN,
							identifier: { sourceType: 'form', key: CMDBuild.core.constants.Proxy.NAME, source: this },
							field: CMDBuild.core.constants.Proxy.MASTER_DETAIL
						}
					}),
					Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.ACTIVE,
						fieldLabel: CMDBuild.Translation.active,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						inputValue: true,
						uncheckedValue: false
					}),
					Ext.create('Ext.form.field.Hidden', { name: CMDBuild.core.constants.Proxy.ID })
				]
			});

			this.callParent(arguments);

			this.setDisabledModify(true, true, true);
		}
	});

})();
