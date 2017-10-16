(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.connector.Step6', {
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
		 * @property {CMDBuild.controller.administration.taskManager.task.connector.Step6}
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

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.connector.Step6', { delegate: this });
		},

		buildClassCombo: function () {
			var me = this;

			this.view.referenceMappingGrid.columns[0].setEditor({
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
						me.buildDomainCombo(this.getValue());
					}
				}
			});
		},

		/**
		 * To setup domain combo editor
		 *
		 * @param {String} className
		 * @param (Boolean) onStepEditExecute
		 */
		buildDomainCombo: function (className, onStepEditExecute) {
			if (!Ext.isEmpty(className)) {
				var me = this;
				var domainStore = _CMCache.getDomainsBy(function (domain) {
					return (
						(domain.get(CMDBuild.core.constants.Proxy.NAME_CLASS_1) == className)
						|| (domain.get(CMDBuild.core.constants.Proxy.NAME_CLASS_2) == className)
					);
				});

				if (Ext.isEmpty(onStepEditExecute))
					var onStepEditExecute = true;

				if (domainStore.length > 0) {
					this.view.referenceMappingGrid.columns[1].setEditor({
						xtype: 'combo',
						displayField: CMDBuild.core.constants.Proxy.NAME,
						valueField: CMDBuild.core.constants.Proxy.NAME,
						forceSelection: true,
						editable: false,
						allowBlank: false,

						store: Ext.create('Ext.data.Store', {
							autoLoad: true,
							fields: [CMDBuild.core.constants.Proxy.NAME],
							data: domainStore
						}),

						listeners: {
							select: function (combo, records, eOpts) {
								me.cmOn('onStepEdit');
							}
						}
					});
				} else {
					this.view.referenceMappingGrid.columns[1].setEditor({
						xtype: 'combo',
						disabled: true
					});
				}

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

				if (!Ext.isEmpty(this.view.gridSelectionModel))
					// To validate and filter grid rows
					this.view.referenceMappingGrid.getStore().each(function (record) {
						if (
							!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.CLASS_NAME))
							&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.DOMAIN_NAME))
						) {
							var buffer = {};

							buffer[CMDBuild.core.constants.Proxy.CLASS_NAME] = record.get(CMDBuild.core.constants.Proxy.CLASS_NAME);
							buffer[CMDBuild.core.constants.Proxy.DOMAIN_NAME] = record.get(CMDBuild.core.constants.Proxy.DOMAIN_NAME);

							data.push(buffer);
						}
					});

				return data;
			},

		/**
		 * Function to update rows stores/editors on beforeEdit event
		 *
		 * @param {String} fieldName
		 * @param {Object} rowData
		 */
		onBeforeEdit: function (fieldName, rowData) {
			switch (fieldName) {
				case CMDBuild.core.constants.Proxy.DOMAIN_NAME: {
					if (!Ext.isEmpty(rowData[CMDBuild.core.constants.Proxy.CLASS_NAME])) {
						this.buildDomainCombo(rowData[CMDBuild.core.constants.Proxy.CLASS_NAME]);
					} else {
						var columnModel = this.view.referenceMappingGrid.columns[1];
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
		}
	});

})();
