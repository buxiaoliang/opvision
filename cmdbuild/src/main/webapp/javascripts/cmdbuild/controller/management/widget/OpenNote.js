(function() {

	Ext.define('CMDBuild.controller.management.widget.OpenNote', {
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
			'widgetOpenNoteBeforeActiveView = beforeActiveView'
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
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		tabDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.openNote.Configuration',

		/**
		 * @param {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView} configurationObject.view
		 * @param {CMDBuild.controller.management.common.CMWidgetManagerController} configurationObject.parentDelegate
		 * @param {Object} configurationObject.widgetConfiguration
		 * @param {Ext.form.Basic} configurationObject.clientForm
		 * @param {CMDBuild.model.CMActivityInstance} configurationObject.card
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view.enable(); // FIXME: force tab enable because tab is created before widget controllers initialization because of ugly implementation of activity tab

			// Shorthands
			this.tabDelegate = this.view.delegate;

			// Build toolbars
			this.tabDelegate.cmfg('workflowFormTabNoteToolbarBottomBuild', [
				Ext.create('CMDBuild.core.buttons.text.Save', {
					scope: this,

					handler: function (button, e) {
						this.tabDelegate.cmfg('onWorkflowFormTabNoteSaveButtonClick');
					}
				}),
				Ext.create('CMDBuild.core.buttons.text.Abort', {
					scope: this,

					handler: function (button, e) {
						this.tabDelegate.cmfg('onWorkflowFormTabNoteAbortButtonClick');
					}
				}),
				Ext.create('CMDBuild.core.buttons.text.Back', {
					disablePanelFunctions: true,
					scope: this,

					handler: function (button, e) {
						this.tabDelegate.cmfg('workflowFormPanelTabActiveSet');
					}
				})
			]);
			this.tabDelegate.cmfg('workflowFormTabNoteToolbarTopBuild', [
				Ext.create('CMDBuild.core.buttons.iconized.Modify', {
					text: CMDBuild.Translation.modifyNote,
					scope: this,

					handler: function (button, e) {
						this.tabDelegate.cmfg('onWorkflowFormTabNoteModifyButtonClick');
					}
				})
			]);
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		widgetOpenNoteBeforeActiveView: function () {
			this.view.enable();

			this.tabDelegate.cmfg('workflowFormPanelTabActiveSet', this.view);

			this.beforeActiveView(); // Custom callParent
		}
	});

})();
