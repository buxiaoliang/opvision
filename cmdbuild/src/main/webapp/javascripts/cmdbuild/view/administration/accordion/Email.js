(function () {

	Ext.define('CMDBuild.view.administration.accordion.Email', {
		extend: 'CMDBuild.view.common.abstract.Accordion',

		/**
		 * @cfg {CMDBuild.controller.administration.accordion.TaskManager}
		 */
		delegate: undefined,

		title: CMDBuild.Translation.email
	});

})();
