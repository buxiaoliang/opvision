(function () {

	Ext.define('CMDBuild.view.management.accordion.DataView', {
		extend: 'CMDBuild.view.common.abstract.Accordion',

		uese: ['CMDBuild.model.dataView.accordion.Management'],

		/**
		 * @cfg {CMDBuild.controller.management.accordion.DataView}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		//storeModelName: 'CMDBuild.model.dataView.accordion.Management',

		title: CMDBuild.Translation.views
	});

})();
