(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step4', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Connector'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Connector}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onBeforeEdit', // TODO: this.onBeforeEdit(param.fieldName, param.rowData);
			'onCheckDelete', // TODO: this.onCheckDelete(param.checked, param.rowIndex);
			'onStepEdit'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.connector.Step4}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.connector.Connector} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.connector.Step4', { delegate: this });
		},

		buildDeletionTypeCombo: function () {
			var me = this;

			this.view.classLevelMappingGrid.columns[5].setEditor({
				xtype: 'combo',
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				valueField: CMDBuild.core.constants.Proxy.VALUE,
				forceSelection: true,
				editable: false,
				allowBlank: true,

				store: CMDBuild.proxy.administration.taskManager.task.Connector.getStoreDeletionTypes(),
				queryMode: 'local',

				listeners: {
					select: function (combo, records, eOpts) {
						me.cmOn('onStepEdit');
					}
				}
			});
		},

		// GETters functions
			/**
			 * @return {Array} data
			 */
			getData: function () {
				var data = [];

				// To validate and filter grid rows
				this.view.classLevelMappingGrid.getStore().each(function (record) {
					if (
						!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME))
						&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME))
					) {
						var buffer = {};

						buffer[CMDBuild.core.constants.Proxy.CLASS_NAME] = record.get(CMDBuild.core.constants.Proxy.CLASS_NAME);
						buffer[CMDBuild.core.constants.Proxy.SOURCE_NAME] = record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME);
						buffer[CMDBuild.core.constants.Proxy.CREATE] = record.get(CMDBuild.core.constants.Proxy.CREATE);
						buffer[CMDBuild.core.constants.Proxy.UPDATE] = record.get(CMDBuild.core.constants.Proxy.UPDATE);
						buffer[CMDBuild.core.constants.Proxy.DELETE] = record.get(CMDBuild.core.constants.Proxy.DELETE);

//						// TODO: future implementation
//						if (buffer[CMDBuild.core.constants.Proxy.DELETE])
//							buffer[CMDBuild.core.constants.Proxy.DELETE_TYPE] = record.get(CMDBuild.core.constants.Proxy.DELETE_TYPE);

						data.push(buffer);
					}
				});

				return data;
			},

			/**
			 * Function used from next step to get all selected class names filtered from duplicates
			 *
			 * @return {Array} selectedClassArray
			 */
			getSelectedClassArray: function () {
				var selectedClassArray = [];
				var gridData = this.getData();

				for (key in gridData)
					if (!Ext.Array.contains(selectedClassArray, gridData[key][CMDBuild.core.constants.Proxy.CLASS_NAME]))
						selectedClassArray.push(gridData[key][CMDBuild.core.constants.Proxy.CLASS_NAME]);

				return selectedClassArray;
			},

			/**
			 * Function used from next step to get all selected source names filtered from duplicates
			 *
			 * @return {Array} selectedSourceArray
			 */
			getSelectedSourceArray: function () {
				var selectedSourceArray = [];
				var gridData = this.getData();

				for (var key in gridData)
					if (!Ext.Array.contains(selectedSourceArray, gridData[key][CMDBuild.core.constants.Proxy.SOURCE_NAME]))
						selectedSourceArray.push(gridData[key][CMDBuild.core.constants.Proxy.SOURCE_NAME]);

				return selectedSourceArray;
			},

		/**
		 * @return {Boolean}
		 */
		isEmptyMappingGrid: function () {
			return Ext.Object.isEmpty(this.getData());
		},

		/**
		 * @param {String} cls
		 */
		markInvalidTable: function (cls) {
			this.view.classLevelMappingGrid.addBodyCls(cls);
		},

		/**
		 * @param {String} cls
		 */
		markValidTable: function (cls) {
			this.view.classLevelMappingGrid.removeBodyCls(cls);
		},

		/**
		 * Resetting deletionType cell value if checkbox is unchecked
		 *
		 * @param {Boolean} checked
		 * @param {Int} rowIndex
		 */
		onCheckDelete: function (checked, rowIndex) {
			if (!checked)
				this.view.classLevelMappingGrid.getStore().getAt(rowIndex).set(CMDBuild.core.constants.Proxy.DELETE_TYPE, '');
		},

		/**
		 * Function to update rows stores/editors on beforeEdit event
		 *
		 * @param {String} fieldName
		 * @param {Object} rowData
		 */
		onBeforeEdit: function (fieldName, rowData) {
			switch (fieldName) {
				case CMDBuild.core.constants.Proxy.DELETE_TYPE: {
					if (rowData[CMDBuild.core.constants.Proxy.DELETE]) {
						this.buildDeletionTypeCombo();
					} else {
						var columnModel = this.view.classLevelMappingGrid.columns[5];
						var columnEditor = columnModel.getEditor();

						if (!columnEditor.disabled)
							columnModel.setEditor({
								xtype: 'combo',
								disabled: true
							});
					}
				} break;
			}
		},

		/**
		 * Step validation (at least one class/source association)
		 */
		onStepEdit: function () {
			this.view.gridEditorPlugin.completeEdit();

			if (!this.isEmptyMappingGrid()) {
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', false);
			} else {
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);
			}
		},

		// SETters functions
			/**
			 * @param {Object} data
			 */
			setData: function (data) {
				this.view.classLevelMappingGrid.getStore().loadData(data);
			},

			/**
			 * @param {Boolean} state
			 */
			setDisabledButtonNext: function (state) {
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', state);
			}
	});

})();
