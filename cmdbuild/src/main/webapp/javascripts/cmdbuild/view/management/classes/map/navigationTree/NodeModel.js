(function() {
	Ext.define('CMDBuild.view.management.classes.map.navigationTree.NodeModel', {
		extend : 'Ext.data.TreeModel',
		idProperty : "cardId",
		fields : [ {
			name : 'text',
			type : 'string'
		}, {
			name : 'visible',
			type : 'boolean'
		}, {
			name : 'cardId',
			type : 'string'
		}, {
			name : 'className',
			type : 'string'
		}, {
			name : 'classId',
			type : 'int'
		}, {
			// to identify the exclusive nodes that
			// represent the base for the vertical overlap
			name : 'baseNode',
			type : 'boolean'
		}, {
			name : 'leaf',
			type : 'boolean'

		}, {
			name : 'checked',
			type : 'boolean'

		}, {
			name : 'expanded',
			type : 'boolean'

		} ]

	});
})();
