(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step5', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.connector.Connector}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onBeforeEdit',
			'onStepEdit'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.connector.Step5}
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

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.connector.Step5', { delegate: this });
		},

		buildClassCombo: function () {
			var me = this;

			this.view.attributeLevelMappingGrid.columns[2].setEditor({
				xtype: 'combo',
				displayField: CMDBuild.core.constants.Proxy.NAME,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				forceSelection: true,
				editable: false,
				allowBlank: false,

				store: this.parentDelegate.getStoreFilteredClass(),
				queryMode: 'local',

				listeners: {
					select: function (combo, records, eOpts) {
						me.buildClassAttributesCombo(this.getValue());
					}
				}
			});
		},

		/**
		 * To setup class attribute combo editor
		 *
		 * @param {String} className
		 * @param {Boolean} onStepEditExecute
		 */
		buildClassAttributesCombo: function (className, onStepEditExecute) {
			if (!Ext.isEmpty(className)) {
				var me = this;
				var attributesListStore = [];

				if (Ext.isEmpty(onStepEditExecute))
					var onStepEditExecute = true;

				for (var key in _CMCache.getClasses())
					if (key == _CMCache.getEntryTypeByName(className).get(CMDBuild.core.constants.Proxy.ID))
						attributesListStore.push(this.view.classesAttributesMap[key]);

				this.view.attributeLevelMappingGrid.columns[3].setEditor({
					xtype: 'combo',
					displayField: CMDBuild.core.constants.Proxy.NAME,
					valueField: CMDBuild.core.constants.Proxy.NAME,
					forceSelection: true,
					editable: false,
					allowBlank: false,

					store: Ext.create('Ext.data.Store', {
						autoLoad: true,
						fields: [CMDBuild.core.constants.Proxy.NAME],
						data: attributesListStore[0]
					}),
					queryMode: 'local',

					listeners: {
						select: function (combo, records, eOpts) {
							me.cmfg('onStepEdit');
						}
					}
				});

				if (onStepEditExecute)
					this.onStepEdit();
			}
		},

		buildSourceCombo: function () {
			var me = this;

			this.view.attributeLevelMappingGrid.columns[0].setEditor({
				xtype: 'combo',
				displayField: CMDBuild.core.constants.Proxy.NAME,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				forceSelection: true,
				editable: false,
				allowBlank: false,

				store: this.parentDelegate.getStoreFilteredSource(),
				queryMode: 'local',

				listeners: {
					select: function (combo, records, eOpts) {
						me.buildSourceAttributesCombo(this.getValue());
					}
				}
			});
		},

		/**
		 * To setup source attribute combo editor
		 *
		 * @param {String} sourceName
		 * @param {Boolean} onStepEditExecute
		 */
		buildSourceAttributesCombo: function (sourceName, onStepEditExecute) {
			if (!Ext.isEmpty(sourceName)) {
				var me = this;
				var attributesListStore = [];

				if (Ext.isEmpty(onStepEditExecute))
					var onStepEditExecute = true;

// TODO: to finish implementation when stores will be ready
//				for (var key in _CMCache.getClasses())
//					if (key == classId)
//						attributesListStore.push(this.view.classesAttributesMap[key]);

				this.view.attributeLevelMappingGrid.columns[1].setEditor({
					xtype: 'combo',
					displayField: CMDBuild.core.constants.Proxy.NAME,
					valueField: CMDBuild.core.constants.Proxy.NAME,

					store: Ext.create('Ext.data.Store', {
						autoLoad: true,
						fields: [CMDBuild.core.constants.Proxy.NAME],
						data: attributesListStore
					}),

					listeners: {
						select: function (combo, records, eOpts) {
							me.cmfg('onStepEdit');
						}
					}
				});

				if (onStepEditExecute)
					this.onStepEdit();
			}
		},

		// GETters functions
			/**
			 * @return {Array} data
			 */
			getData: function () {
				var data = [];

				// To validate and filter grid rows
				this.view.attributeLevelMappingGrid.getStore().each(function (record) {
					if (
						!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME))
						&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE))
						&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME))
						&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE))
					) {
						var buffer = {};

						buffer[CMDBuild.core.constants.Proxy.CLASS_NAME] = record.get(CMDBuild.core.constants.Proxy.CLASS_NAME);
						buffer[CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE] = record.get(CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE);
						buffer[CMDBuild.core.constants.Proxy.SOURCE_NAME] = record.get(CMDBuild.core.constants.Proxy.SOURCE_NAME);
						buffer[CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE] = record.get(CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE);
						buffer[CMDBuild.core.constants.Proxy.IS_KEY] = record.get(CMDBuild.core.constants.Proxy.IS_KEY);

						data.push(buffer);
					}
				});

				return data;
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
			this.view.attributeLevelMappingGrid.addBodyCls(cls);
		},

		/**
		 * @param {String} cls
		 */
		markValidTable: function (cls) {
			this.view.attributeLevelMappingGrid.removeBodyCls(cls);
		},

		/**
		 * Function to update rows stores/editors on beforeEdit event
		 *
		 * @param {String} fieldName
		 * @param {Object} rowData
		 */
		onBeforeEdit: function (fieldName, rowData) {
			switch (fieldName) {
				case CMDBuild.core.constants.Proxy.CLASS_ATTRIBUTE: {
					if (!Ext.isEmpty(rowData[CMDBuild.core.constants.Proxy.CLASS_NAME])) {
						this.buildClassAttributesCombo(rowData[CMDBuild.core.constants.Proxy.CLASS_NAME], false);
					} else {
						var columnModel = this.view.attributeLevelMappingGrid.columns[3];
						var columnEditor = columnModel.getEditor();

						if (!columnEditor.disabled)
							columnModel.setEditor({
								xtype: 'combo',
								disabled: true
							});
					}
				} break;

				case CMDBuild.core.constants.Proxy.SOURCE_ATTRIBUTE: {
					if (!Ext.isEmpty(rowData[CMDBuild.core.constants.Proxy.SOURCE_NAME])) {
						this.buildSourceAttributesCombo(rowData[CMDBuild.core.constants.Proxy.SOURCE_NAME], false);
					} else {
						var columnModel = this.view.attributeLevelMappingGrid.columns[1];
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

// TODO: re-enable when step6 will be implemented
//			if (!this.isEmptyMappingGrid()) {
//				this.cmfg('taskManagerFormNavigationSetDisableNextButton', false);
//			} else {
//				this.cmfg('taskManagerFormNavigationSetDisableNextButton', true);
//			}
		},

		// SETters functions
			/**
			 * @param {Object} data
			 */
			setData: function (data) {
				this.view.attributeLevelMappingGrid.getStore().loadData(data);
			},

			/**
			 * @param {Boolean} state
			 */
			setDisabledButtonNext: function (state) {
				this.cmfg('taskManagerFormNavigationSetDisableNextButton', state);
			}
	});

})();
