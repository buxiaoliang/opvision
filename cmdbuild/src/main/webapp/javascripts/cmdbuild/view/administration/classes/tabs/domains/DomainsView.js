(function () {

	/**
	 * @link CMDBuild.view.administration.workflow.tabs.domains.DomainsView
	 */
	Ext.define('CMDBuild.view.administration.classes.tabs.domains.DomainsView', {
		extend: 'Ext.panel.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.Domains}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.domains.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {Ext.form.field.Checkbox}
		 */
		includeInheritedCheckbox: undefined,

		border: false,
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.domains,

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
							Ext.create('CMDBuild.core.buttons.iconized.add.Add', {
								text: CMDBuild.Translation.addDomain,
								disablePanelFunctions: true,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabDomainsAddButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								text: CMDBuild.Translation.modifyDomain,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabDomainsModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeDomain,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabDomainsRemoveButtonClick');
								}
							}),
							'->',
							this.includeInheritedCheckbox = Ext.create('Ext.form.field.Checkbox', {
								boxLabel: CMDBuild.Translation.includeInherited,
								boxLabelCls: 'cmdb-toolbar-item',
								disablePanelFunctions: true,
								inputValue: true,
								uncheckedValue: false,
								checked: true,
								scope: this,

								handler: function (checkbox, checked) {
									this.delegate.cmfg('onClassesTabDomainsIncludeInheritedCheck');
								}
							})
						]
					})
				],
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.classes.tabs.domains.GridPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onClassesTabDomainsShow');
			}
		}
	});

})();
