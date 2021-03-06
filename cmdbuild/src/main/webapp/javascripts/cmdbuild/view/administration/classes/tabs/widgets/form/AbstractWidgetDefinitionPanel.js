(function () {

	// External implementation to avoid overrides
	Ext.require([
		'CMDBuild.core.constants.FieldWidths',
		'CMDBuild.core.constants.Proxy'
	]);

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.view.administration.classes.tabs.widgets.form.AbstractWidgetDefinitionPanel', {
		extend: 'Ext.form.Panel',

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {Object}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.container.Container}
		 */
		additionalProperties: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		baseProperties: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		fieldType: undefined,

		/**
		 * @property {Ext.form.field.Hidden}
		 */
		idField: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		cls: 'x-panel-body-default-framed cmdb-border-top',
		frame: false,
		overflowY: 'auto',
		region: 'center',
		split: true,

		layout: {
			type: 'hbox',
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
								text: CMDBuild.Translation.modifyWidget,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabWidgetsModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeWidget,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabWidgetsRemoveButtonClick');
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
									this.delegate.cmfg('onClassesTabWidgetsSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabWidgetsAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					this.baseProperties = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.baseProperties,
						flex: 1,

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: this.widgetDefinitionFormBasePropertiesGet()
					}),
					{ xtype: 'splitter' },
					this.additionalProperties = Ext.create('Ext.container.Container', {
						flex: 1,

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: this.widgetDefinitionFormAdditionalPropertiesGet()
					})
				]
			});

			this.callParent(arguments);

			this.setDisabledModify(true, true, true);
		},

		/**
		 * @abstract
		 */
		widgetDefinitionFormAdditionalPropertiesGet: Ext.emptyFn,

		/**
		 * @returns {Array}
		 */
		widgetDefinitionFormBasePropertiesGet: function () {
			return [
				this.fieldType = Ext.create('Ext.form.field.Text', {
					fieldLabel: CMDBuild.Translation.type,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					name: CMDBuild.core.constants.Proxy.TYPE,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					disabled: true,
					disablePanelFunctions: true,
					readOnly: true,
					submitValue: false,

					listeners: {
						scope: this,
						change: function (field, newValue, oldValue, eOpts) {
							field.setValue(this.delegate.cmfg('classesTabWidgetsTypeRenderer', newValue));
						}
					}
				}),
				Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.LABEL,
					fieldLabel: CMDBuild.Translation.buttonLabel,
					maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					allowBlank: false
				}),
				Ext.create('Ext.form.field.Checkbox', {
					name: CMDBuild.core.constants.Proxy.ACTIVE,
					fieldLabel: CMDBuild.Translation.active,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
				}),
				Ext.create('Ext.form.field.Checkbox', {
					name: CMDBuild.core.constants.Proxy.ALWAYS_ENABLED,
					fieldLabel: CMDBuild.Translation.alwaysEnabled,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
				}),
				this.idField = Ext.create('Ext.form.field.Hidden', { name: CMDBuild.core.constants.Proxy.ID })
			];
		}
	});

})();
