(function () {

	/**
	 * @link CMDBuild.controller.management.workflow.panel.tree.filter.advanced.SaveDialog
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.SaveDialog', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormFilterAdvancedSaveDialogShow',
			'onPanelGridAndFormFilterAdvancedSaveDialogAbortButtonClick',
			'onPanelGridAndFormFilterAdvancedSaveDialogSaveButtonClick'
		],

		/**
		 * Parameter to forward to next save call
		 *
		 * @property {Boolean}
		 */
		enableApply: false,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.SaveDialogWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.SaveDialogWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @param {Boolean} enableApply
		 *
		 * @returns {Void}
		 */
		panelGridAndFormFilterAdvancedSaveDialogShow: function (enableApply) {
			if (!this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterIsEmpty')) {
				this.enableApply = Ext.isBoolean(enableApply) ? enableApply : false;

				this.form.loadRecord(this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet'));

				this.view.show();
			} else {
				_error('panelGridAndFormFilterAdvancedSaveDialogShow(): cannot manage empty filter', this, this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet'));
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedSaveDialogAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedSaveDialogSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData();

				this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.DESCRIPTION,
					value: formData[CMDBuild.core.constants.Proxy.DESCRIPTION]
				});
				this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.NAME,
					value: formData[CMDBuild.core.constants.Proxy.NAME]
				});

				this.cmfg('panelGridAndFormFilterAdvancedManagerSave', {
					enableApply: this.enableApply,
					enableSaveDialog: false
				});

				this.cmfg('onPanelGridAndFormFilterAdvancedSaveDialogAbortButtonClick');
			}
		}
	});

})();
