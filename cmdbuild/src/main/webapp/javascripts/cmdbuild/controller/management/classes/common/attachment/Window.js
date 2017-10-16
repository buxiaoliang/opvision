(function () {

	/**
	 * Override to adapt with old implementation of tabs
	 *
	 * @override
	 * @legacy
	 *
	 * FIXME: waiting for refactor (Relations and MasterDetail tabs)
	 */
	Ext.define('CMDBuild.controller.management.classes.common.attachment.Window', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Window',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTemplateResolverFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'onPanelModuleAttachmentWindowCloseButtonClick',
			'panelModuleAttachmentWindowConfigureAndShow',
			'panelModuleAttachmentWindowSelectedEntityGet = panelGridAndFormSelectedEntityGet',
			'panelModuleAttachmentWindowSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'panelModuleAttachmentWindowSelectedItemGet = panelGridAndFormSelectedItemGet',
			'panelModuleAttachmentWindowSelectedItemIsEmpty = panelGridAndFormSelectedItemIsEmpty'
		],

		/**
		 * @returns {Ext.form.Basic or null}
		 */
		classesFormTemplateResolverFormGet: function () {
			return this.parentDelegate.superController.getFormForTemplateResolver();
		}
	});

})();
