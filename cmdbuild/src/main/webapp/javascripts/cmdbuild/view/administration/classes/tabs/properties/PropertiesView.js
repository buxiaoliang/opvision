(function () {

	/**
	 * @link CMDBuild.view.administration.workflow.tabs.properties.PropertiesView
	 */
	Ext.define('CMDBuild.view.administration.classes.tabs.properties.PropertiesView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.Properties}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.FormPanel}
		 */
		form: undefined,

		border: false,
		frame: false,
		layout: 'fit',
		title: CMDBuild.Translation.properties,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				items: [
					this.form = Ext.create('CMDBuild.view.administration.classes.tabs.properties.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		},

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onClassesTabPropertiesShow');
			}
		}
	});

})();
