(function () {

	Ext.define('CMDBuild.view.common.field.trigger.cron.window.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.common.field.trigger.cron.window.Edit}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		each: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		fieldSetExact: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		fieldSetRange: undefined,

		/**
		 * @property {Ext.form.FieldSet}
		 */
		fieldSetStep: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		frame: false,

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
				items: [
					this.each = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.every + ' ' + this.delegate.cmfg('fieldTriggerCronWindowEditConfigurationGet', CMDBuild.core.constants.Proxy.TITLE).toLowerCase(),
						border: false,
						checkboxName: CMDBuild.core.constants.Proxy.MODE,
						checkboxToggle: true,
						checkboxValue: 'each',
						collapsed: false,
						collapsible: false,
						controllerxType: 'radio',
						toggleOnTitleClick: true,

						listeners: {
							scope: this,
							checkchange: function (field, checked, eOpts) {
								if (checked)
									this.delegate.cmfg('onFieldTriggerCronWindowEditFieldSetChecked', field.checkboxValue);
							}
						}
					}),
					this.fieldSetStep = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.inAStepWith,
						checkboxName: CMDBuild.core.constants.Proxy.MODE,
						checkboxToggle: true,
						checkboxValue: 'step',
						collapsed: false,
						collapsible: false,
						controllerxType: 'radio',
						toggleOnTitleClick: true,

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							Ext.create('Ext.form.field.Text', {
								fieldLabel: this.delegate.cmfg('fieldTriggerCronWindowEditConfigurationGet', CMDBuild.core.constants.Proxy.TITLE),
								name: 'valueStep'
							})
						],

						listeners: {
							scope: this,
							checkchange: function (field, checked, eOpts) {
								if (checked)
									this.delegate.cmfg('onFieldTriggerCronWindowEditFieldSetChecked', field.checkboxValue);
							}
						}
					}),
					this.fieldSetRange = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.inARange,
						checkboxName: CMDBuild.core.constants.Proxy.MODE,
						checkboxToggle: true,
						checkboxValue: 'range',
						collapsed: false,
						collapsible: false,
						controllerxType: 'radio',
						toggleOnTitleClick: true,

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							Ext.create('Ext.form.field.Text', {
								fieldLabel: CMDBuild.Translation.from,
								name: 'valueFrom'
							}),
							Ext.create('Ext.form.field.Text', {
								fieldLabel: CMDBuild.Translation.to,
								name: 'valueTo'
							})
						],

						listeners: {
							scope: this,
							checkchange: function (field, checked, eOpts) {
								if (checked)
									this.delegate.cmfg('onFieldTriggerCronWindowEditFieldSetChecked', field.checkboxValue);
							}
						}
					}),
					this.fieldSetExact = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.atAnExact,
						checkboxName: CMDBuild.core.constants.Proxy.MODE,
						checkboxToggle: true,
						checkboxValue: 'exactly',
						collapsed: false,
						collapsible: false,
						controllerxType: 'radio',
						toggleOnTitleClick: true,

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							Ext.create('Ext.form.field.Text', {
								fieldLabel: this.delegate.cmfg('fieldTriggerCronWindowEditConfigurationGet', CMDBuild.core.constants.Proxy.TITLE),
								name: 'exactly'
							})
						],

						listeners: {
							scope: this,
							checkchange: function (field, checked, eOpts) {
								if (checked)
									this.delegate.cmfg('onFieldTriggerCronWindowEditFieldSetChecked', field.checkboxValue);
							}
						}
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
