(function () {

	Ext.define('CMDBuild.view.administration.domain.tabs.properties.PropertiesView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.administration.domain.tabs.Properties}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.properties.FormPanel}
		 */
		form: undefined,

		bodyCls: 'cmdb-gray-panel-no-padding',
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
					this.form = Ext.create('CMDBuild.view.administration.domain.tabs.properties.FormPanel', { delegate: this.delegate })
				]
			});

			this.callParent(arguments);
		}
	});

})();
