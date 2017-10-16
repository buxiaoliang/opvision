(function () {

	Ext.define('CMDBuild.controller.administration.configuration.Gis', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.configuration.Gis'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.Configuration}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onConfigurationGisSaveButtonClick',
			'onConfigurationGisTabShow = onConfigurationGisAbortButtonClick'
		],

		/**
		 * @property {CMDBuild.view.administration.configuration.GisPanel}
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

			this.view = Ext.create('CMDBuild.view.administration.configuration.GisPanel', { delegate: this });
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationGisSaveButtonClick: function () {
			var configurationModel = Ext.create('CMDBuild.model.administration.configuration.Gis', this.view.panelFunctionDataGet());

			CMDBuild.proxy.administration.configuration.Gis.update({
				params: configurationModel.getParamsObject(),
				scope: this,
				callback: function (options, success, response) {
					this.cmfg('onConfigurationGisTabShow');
				},
				success: function (response, options, decodedResponse) {
					CMDBuild.core.Message.success();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationGisTabShow: function () {
			CMDBuild.proxy.administration.configuration.Gis.read({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.view.loadRecord(Ext.create('CMDBuild.model.administration.configuration.Gis', decodedResponse));

						Ext.create('CMDBuild.core.configurations.builder.Gis', { // Rebuild configuration model
							scope: this,
							callback: function (options, success, response) {
								this.cmfg('mainViewportAccordionSetDisabled', {
									identifier: 'gis',
									state: !CMDBuild.configuration.gis.get(CMDBuild.core.constants.Proxy.ENABLED)
								});
							}
						});
					}
				}
			});
		}
	});

})();
