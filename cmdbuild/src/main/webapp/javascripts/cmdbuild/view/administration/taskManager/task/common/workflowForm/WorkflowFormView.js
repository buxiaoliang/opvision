(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.workflowForm.WorkflowFormView', {
		extend: 'Ext.form.FieldContainer',

		requires: ['CMDBuild.core.constants.FieldWidths'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.WorkflowForm}
		 */
		delegate: undefined,

		border: false,
		considerAsFieldToDisable: true,
		fieldLabel: CMDBuild.Translation.workflow,
		labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		/**
		 * To acquire informations to setup fields before creation
		 *
		 * @param {Object} configuration
		 * @param {Object} configuration.combo
		 * @param {Object} configuration.grid
		 * @param {Object} configuration.widthFixDisable
		 */
		constructor: function (configuration) {
			this.delegate = Ext.create('CMDBuild.controller.administration.taskManager.task.common.WorkflowForm', this);

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.combo)) {
				this.comboConfig = { delegate: this.delegate };
			} else {
				this.comboConfig = configuration.combo;
				this.comboConfig.delegate = this.delegate;
			}

			if (Ext.isEmpty(configuration) || Ext.isEmpty(configuration.grid)) {
				this.gridConfig = { delegate: this.delegate };
			} else {
				this.gridConfig = configuration.grid;
				this.gridConfig.delegate = this.delegate;
			}

			if (Ext.isEmpty(configuration.widthFixDisable))
				this.delegate.fieldWidthsFix();

			this.callParent(arguments);
		},

		initComponent: function () {
			this.combo = Ext.create('CMDBuild.view.administration.taskManager.task.common.workflowForm.Combobox', this.comboConfig);
			this.delegate.comboField = this.combo;

			this.grid = Ext.create('CMDBuild.view.administration.taskManager.task.common.workflowForm.GridPanel', this.gridConfig);
			this.delegate.gridField = this.grid;
			this.delegate.gridEditorPlugin = this.grid.gridEditorPlugin;

			Ext.apply(this, {
				items: [this.combo, this.grid]
			});

			this.callParent(arguments);
		}
	});

})();
