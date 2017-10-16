(function() {

	/**
	 * This class have some custom code different from linked ones
	 *
	 * @link CMDBuild.view.administration.classes.tabs.attributes.CMAttributes
	 * @link CMDBuild.view.administration.workflow.CMAttributes
	 */

	Ext.define('CMDBuild.view.administration.domain.tabs.attributes.CMAttributes', {
		extend: 'Ext.panel.Panel',

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.attributes.CMAttributesForm}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.attributes.CMAttributeGrid}
		 */
		grid: undefined,

		layout: 'border',
		title: CMDBuild.Translation.attributes,

		initComponent: function() {
			Ext.apply(this, {
				items: [
					this.grid = Ext.create('CMDBuild.view.administration.domain.tabs.attributes.CMAttributeGrid', {
						delegate: this.delegate,
						region: 'north',
						split: true,
						height: '30%'
					}),
					this.form = Ext.create('CMDBuild.view.administration.domain.tabs.attributes.CMAttributesForm', {
						delegate: this.delegate,
						region: 'center'
					})
				]
			});

			this.callParent(arguments);

			this.form.disableModify();
		},

		onAddAttributeClick: function() {
			this.form.onAddAttributeClick(params=null, enableAll=true);
			this.grid.getSelectionModel().deselectAll();
		}
	});

})();