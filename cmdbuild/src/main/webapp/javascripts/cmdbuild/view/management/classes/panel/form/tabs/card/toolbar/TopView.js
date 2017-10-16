(function () {

	Ext.define('CMDBuild.view.management.classes.panel.form.tabs.card.toolbar.TopView', {
		extend: 'CMDBuild.view.common.panel.module.form.toolbar.TopView',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Top}
		 */
		delegate: undefined,

		/**
		 * @cfg {CMDBuild.core.buttons.iconized.Clone}
		 */
		buttonClone: undefined,

		/**
		 * @cfg {CMDBuild.core.buttons.iconized.Modify}
		 */
		buttonModify: undefined,

		/**
		 * @cfg {CMDBuild.core.buttons.iconized.split.Print}
		 */
		buttonPrint: undefined,

		/**
		 * @cfg {CMDBuild.core.buttons.iconized.RelationGraph}
		 */
		buttonRelationGraph: undefined,

		/**
		 * @cfg {CMDBuild.core.buttons.iconized.Remove}
		 */
		buttonRemove: undefined,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.buttonModify = Ext.create('CMDBuild.core.buttons.iconized.Modify', {
						text: CMDBuild.Translation.modifyCard,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onClassesFormTabCardToolbarTopModifyButtonClick');
						}
					}),
					this.buttonRemove = Ext.create('CMDBuild.core.buttons.iconized.Remove', {
						text: CMDBuild.Translation.removeCard,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onClassesFormTabCardRemoveButtonClick');
						}
					}),
					this.buttonClone = Ext.create('CMDBuild.core.buttons.iconized.Clone', {
						text: CMDBuild.Translation.cloneCard,
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onClassesFormTabCardToolbarTopCloneButtonClick');
						}
					}),
					this.buttonRelationGraph = Ext.create('CMDBuild.core.buttons.iconized.RelationGraph', {
						scope: this,

						handler: function (button, e) {
							this.delegate.cmfg('onClassesFormTabCardToolbarTopGraphButtonClick');
						}
					}),
					this.buttonPrint = Ext.create('CMDBuild.core.buttons.iconized.split.Print', {
						delegate: this.delegate,
						delegateEventPrefix: 'onClassesFormTabCard',
						formatList: [
							CMDBuild.core.constants.Proxy.PDF,
							CMDBuild.core.constants.Proxy.ODT
						],
						text: CMDBuild.Translation.print + ' ' + CMDBuild.Translation.card.toLowerCase()
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();
