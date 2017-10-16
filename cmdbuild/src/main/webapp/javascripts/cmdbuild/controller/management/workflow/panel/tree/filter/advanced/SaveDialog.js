(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.SaveDialog', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeFilterAdvancedSaveDialogAbortButtonClick',
			'onWorkflowTreeFilterAdvancedSaveDialogSaveButtonClick',
			'workflowTreeFilterAdvancedSaveDialogShow'
		],

		/**
		 * Parameter to forward to next save call
		 *
		 * @property {Boolean}
		 */
		enableApply: false,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.saveDialog.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.saveDialog.SaveDialogWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.saveDialog.SaveDialogWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedSaveDialogAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedSaveDialogSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData();

				this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.DESCRIPTION,
					value: formData[CMDBuild.core.constants.Proxy.DESCRIPTION]
				});
				this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.NAME,
					value: formData[CMDBuild.core.constants.Proxy.NAME]
				});

				this.cmfg('workflowTreeFilterAdvancedManagerSave', {
					enableApply: this.enableApply,
					enableSaveDialog: false
				});

				this.cmfg('onWorkflowTreeFilterAdvancedSaveDialogAbortButtonClick');
			}
		},

		/**
		 * @param {Boolean} enableApply
		 *
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedSaveDialogShow: function (enableApply) {
			if (!this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty')) {
				this.enableApply = Ext.isBoolean(enableApply) ? enableApply : false;

				this.form.loadRecord(this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));

				this.view.show();
			} else {
				_error('workflowTreeFilterAdvancedSaveDialogShow(): cannot manage empty filter', this, this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));
			}
		}
	});

})();
