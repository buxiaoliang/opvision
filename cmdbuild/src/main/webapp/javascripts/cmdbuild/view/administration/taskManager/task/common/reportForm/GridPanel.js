(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.reportForm.GridPanel', {
		extend: 'Ext.grid.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.taskManager.task.common.reportForm.Grid'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.ReportForm}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.grid.plugin.CellEditing}
		 */
		cellEditingPlugin: undefined,

		considerAsFieldToDisable: true,
		disabled: true,
		margin: '0 0 0 ' + (CMDBuild.core.constants.FieldWidths.LABEL - 5),
		maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
		title: CMDBuild.Translation.parameters,

		/**
		 * @returns {View}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				columns: [
					{
						dataIndex: CMDBuild.core.constants.Proxy.DESCRIPTION,
						text: CMDBuild.Translation.descriptionLabel,
						flex: 1
					},
					Ext.create('Ext.grid.column.CheckColumn', {
						dataIndex: CMDBuild.core.constants.Proxy.EDITING_MODE,
						text: CMDBuild.Translation.cqlExpression,
						width: 100,
						align: 'center',
						hideable: false,
						menuDisabled: true,
						fixed: true,
						scope: this,

						listeners: {
							scope: this,
							checkchange: function (column, rowIndex, checked, eOpts) {
								this.delegate.cmfg('onTaskManagerReportFormEditingModeCheckChange', {
								    rowIndex : rowIndex, checked : checked
								});
							}
						}
					}),
					{
						dataIndex: CMDBuild.core.constants.Proxy.VALUE,
						text: CMDBuild.Translation.value,
						flex: 1,
						renderer : function(value, metaData, record, row, col, store, gridView) {
						    var type = record.raw[CMDBuild.core.constants.Proxy.TYPE];
						    var cqlMode = record.get(CMDBuild.core.constants.Proxy.EDITING_MODE);
						    if (type === "DATE" && ! cqlMode) { // if cql is a text
							var date = this.formattedValue(value);
							return date;
						    }
						  return value; 
						},
						editor: { xtype: 'textfield' }
					}
				],
				plugins: [
					this.cellEditingPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
						clicksToEdit: 1,

						listeners: {
							scope: this,
							beforeedit: function (editor, e, eOpts) {
								this.delegate.cmfg('onTaskManagerReportFormBeforeEdit', {
									column: e.column,
									columnName: e.field,
									record: e.record
								});
							}
						}
					})
				],
				store: Ext.create('Ext.data.Store', {
					model: 'CMDBuild.model.administration.taskManager.task.common.reportForm.Grid',
					data: []
				})
			});

			this.callParent(arguments);
		},
		formattedValue : function(value) {
		    var dateObject = new Date(value);
		    if (dateObject.toString() === "Invalid Date") {
			return "";
		    }
		    var date = Ext.util.Format.date(dateObject, CMDBuild.core.configurations.DataFormat.getDate());
		    return date;
		}
	});

})();
