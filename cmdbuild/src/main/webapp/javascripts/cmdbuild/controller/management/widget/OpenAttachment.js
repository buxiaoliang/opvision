(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormPanelFormTabActiveSet
	 */
	Ext.define('CMDBuild.controller.management.widget.OpenAttachment', {
		extend: 'CMDBuild.controller.common.abstract.Widget',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.CMActivityInstance}
		 */
		card: undefined,

		/**
		 * @property {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'beforeHideView',
			'getData',
			'isValid',
			'onBeforeSave',
			'onEditMode',
			'widgetOpenAttachmentBeforeActiveView = beforeActiveView'
		],

		/**
		 * Disable delegate apply to avoid to set this class as view's delegate
		 *
		 * @cfg {Boolean}
		 *
		 * @override
		 */
		enableDelegateApply: false,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.TabView}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.openAttachment.Configuration',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		widgetOpenAttachmentBeforeActiveView: function () {
			this.view.enable();

			this.view.delegate.cmfg('panelGridAndFormPanelFormTabActiveSet', this.view);

			this.beforeActiveView(); // Custom callParent
		}
	});

})();
