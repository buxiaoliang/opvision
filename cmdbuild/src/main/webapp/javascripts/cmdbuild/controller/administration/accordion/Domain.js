(function () {

	Ext.define('CMDBuild.controller.administration.accordion.Domain', {
		extend: 'CMDBuild.controller.common.abstract.Accordion',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.domain.Domain'
		],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.view.administration.accordion.Domain}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.accordion.Domain', { delegate: this });

			this.cmfg('accordionUpdateStore');
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.loadMask
		 * @param {Number} parameters.selectionId
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		accordionUpdateStore: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.selectionId = Ext.isNumber(parameters.selectionId) ? parameters.selectionId : null;

			CMDBuild.proxy.administration.domain.Domain.readAll({
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

					// Removes all system domains
					decodedResponse = Ext.Array.filter(decodedResponse, function (item, i, array) {
						return !item[CMDBuild.core.constants.Proxy.SYSTEM]; // Discard system domains
					}, this);

					this.view.getStore().getRootNode().removeAll();

					if (!Ext.isEmpty(decodedResponse)) {
						var nodes = [];

						Ext.Array.each(decodedResponse, function (domainObject, i, allDomainObjects) {
							var nodeObject = {};
							nodeObject['cmName'] = this.cmfg('accordionIdentifierGet');
							nodeObject['iconCls'] = 'cmdb-tree-domain-icon';
							nodeObject[CMDBuild.core.constants.Proxy.TEXT] = domainObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = domainObject[CMDBuild.core.constants.Proxy.DESCRIPTION];
							nodeObject[CMDBuild.core.constants.Proxy.ENTITY_ID] = domainObject[CMDBuild.core.constants.Proxy.ID_DOMAIN];
							nodeObject[CMDBuild.core.constants.Proxy.ID] = this.cmfg('accordionBuildId', domainObject[CMDBuild.core.constants.Proxy.ID_DOMAIN]);
							nodeObject[CMDBuild.core.constants.Proxy.LEAF] = true;

							nodes.push(nodeObject);
						}, this);

						if (!Ext.isEmpty(nodes)) {
							this.view.getStore().getRootNode().appendChild(nodes);
							this.view.getStore().sort();
						}
					}

					this.updateStoreCommonEndpoint(parameters); // CallParent alias
				}
			});

			this.callParent(arguments);
		}
	});

})();
