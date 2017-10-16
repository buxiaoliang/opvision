(function () {

	Ext.define('CMDBuild.proxy.utility.BulkUpdate', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.utility.bulkUpdate.ClassesTree',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		bulkUpdate: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.bulkUpdate });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		bulkUpdateFromFilter: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.bulkUpdateFromFilter });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		},

		/**
		 * @returns {Ext.data.TreeStore} store
		 */
		getStoreClassesTree: function () {
			var store = Ext.create('Ext.data.TreeStore', {
				autoLoad: false,
				model: 'CMDBuild.model.utility.bulkUpdate.ClassesTree',
				root: {
					expanded: true,
					children: []
				},
				sorters: [
					{ property: 'cmIndex', direction: 'ASC' },
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.utility.BulkUpdate.readAllClasses({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					var nodes = [];
					var standardNodesMap = {};

					// Filters simple, root and system classes
					decodedResponse = Ext.Array.filter(decodedResponse, function (item, i, array) {
						return (
							item[CMDBuild.core.constants.Proxy.TYPE] != CMDBuild.core.constants.Global.getTableTypeSimpleTable()
							&& item[CMDBuild.core.constants.Proxy.NAME] != CMDBuild.core.constants.Global.getRootNameClasses()
							&& !item[CMDBuild.core.constants.Proxy.SYSTEM]
						);
					}, this);

					if (!Ext.isEmpty(decodedResponse)) {
						Ext.Array.forEach(decodedResponse, function (classObject, i, allClassObjects) {
							var nodeObject = {};
							nodeObject['iconCls'] = classObject['superclass'] ? 'cmdb-tree-superclass-icon' : 'cmdb-tree-class-icon';
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = classObject[CMDBuild.core.constants.Proxy.TEXT];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = classObject[CMDBuild.core.constants.Proxy.ID];
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;
							nodeObject[CMDBuild.core.constants.Proxy.NAME] = classObject[CMDBuild.core.constants.Proxy.NAME];
							nodeObject[CMDBuild.core.constants.Proxy.PARENT] = classObject[CMDBuild.core.constants.Proxy.PARENT];
							nodeObject[CMDBuild.core.constants.Proxy.SELECTABLE] = classObject['priv_write'];
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = classObject[CMDBuild.core.constants.Proxy.TEXT];

							if (!nodeObject[CMDBuild.core.constants.Proxy.SELECTABLE])
								nodeObject['cls'] = 'cmdb-tree-node-disabled';

							standardNodesMap[nodeObject[CMDBuild.core.constants.Proxy.ID]] = nodeObject;
						}, this);

						// Builds full standard/simple classes trees
						for (var id in standardNodesMap) {
							var node = standardNodesMap[id];

							if (
								!Ext.isEmpty(node[CMDBuild.core.constants.Proxy.PARENT])
								&& !Ext.isEmpty(standardNodesMap[node[CMDBuild.core.constants.Proxy.PARENT]])
							) {
								var parentNode = standardNodesMap[node[CMDBuild.core.constants.Proxy.PARENT]];
								parentNode.children = parentNode.children || [];
								parentNode.children.push(node);
								parentNode[CMDBuild.core.constants.Proxy.LEAF] = false;
							} else {
								nodes.push(node);
							}
						}

						// Manually sorting to avoid main classes group sorting
						CMDBuild.core.Utils.objectArraySort(nodes, CMDBuild.core.constants.Proxy.TEXT);

						store.getRootNode().removeAll();

						if (!Ext.isEmpty(nodes))
							store.getRootNode().appendChild(nodes);
					}
				}
			});

			return store;
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllClasses: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAttributes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attribute.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ATTRIBUTE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readClassById: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readById });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		}
	});

})();
