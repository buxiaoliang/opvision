(function () {

	Ext.define('CMDBuild.view.management.workflow.panel.tree.TreeColumn', {
		extend: 'Ext.tree.Column',

		maxWidth: 20,
		menuDisabled: true,
		minWidth: 20,
		resizable: false,
		sortable: false,

		/**
		 * @param {Mixed} value
		 * @param {Object} metadata
		 * @param {CMDBuild.model.management.workflow.Node} record
		 * @param {Number} rowIndex
		 * @param {Number} colIndex
		 * @param {Ext.data.NodeStore} store
		 * @param {Ext.tree.View} view
		 *
		 * @returns {String}
		 *
		 * @override
		 */
		defaultRenderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
			return this.cmfg('workflowTreeRendererTreeColumn', {
				metadata: metadata,
				record: record,
				value: value
			});
		}
	});

})();
