(function () {

	Ext.define('CMDBuild.controller.administration.configuration.RelationGraph', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.configuration.RelationGraph'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.Configuration}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onConfigurationRelationGraphSaveButtonClick',
			'onConfigurationRelationGraphTabShow = onConfigurationRelationGraphAbortButtonClick'
		],

		/**
		 * @property {CMDBuild.view.administration.configuration.RelationGraphPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.configuration.Configuration} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.configuration.RelationGraphPanel', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationRelationGraphSaveButtonClick: function () {
			var configurationModel = Ext.create('CMDBuild.model.administration.configuration.RelationGraph', this.view.panelFunctionDataGet({ includeDisabled: true }));

			CMDBuild.proxy.administration.configuration.RelationGraph.update({
				params: configurationModel.getParamsObject(),
				scope: this,
				success: function (response, options, decodedResponse) {
					this.cmfg('onConfigurationRelationGraphTabShow');

					CMDBuild.core.Message.success();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationRelationGraphTabShow: function () {
			CMDBuild.proxy.administration.configuration.RelationGraph.read({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.view.loadRecord(Ext.create('CMDBuild.model.administration.configuration.RelationGraph', decodedResponse));

						Ext.create('CMDBuild.core.configurations.builder.RelationGraph'); // Rebuild configuration model
					}
				}
			});
		}
	});

})();
