(function () {

	Ext.define('CMDBuild.controller.administration.configuration.Dms', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.configuration.Dms'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.configuration.Configuration}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onConfigurationDmsFieldSetExpand',
			'onConfigurationDmsSaveButtonClick',
			'onConfigurationDmsTabShow = onConfigurationDmsAbortButtonClick'
		],

		/**
		 * @property {CMDBuild.view.administration.configuration.DmsPanel}
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

			this.view = Ext.create('CMDBuild.view.administration.configuration.DmsPanel', { delegate: this });
		},

		/**
		 * @param {String} expandedFieldSetIdentifier
		 *
		 * @returns {Void}
		 */
		onConfigurationDmsFieldSetExpand: function (expandedFieldSetIdentifier) {
			if (!Ext.isEmpty(expandedFieldSetIdentifier) && Ext.isString(expandedFieldSetIdentifier))
				switch (expandedFieldSetIdentifier) {
					case CMDBuild.core.constants.Proxy.ALFRESCO:
						return this.view.fieldSetCmis.collapse();

					case CMDBuild.core.constants.Proxy.CMIS:
						return this.view.fieldSetAlfresco.collapse();
				}
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationDmsSaveButtonClick: function () {
			var configurationModel = Ext.create('CMDBuild.model.administration.configuration.dms.Dms', this.view.panelFunctionDataGet({ includeDisabled: true }));

			CMDBuild.proxy.administration.configuration.Dms.update({
				params: configurationModel.getParamsObject(),
				scope: this,
				success: function (response, options, decodedResponse) {
					this.cmfg('onConfigurationDmsTabShow');

					CMDBuild.core.Message.success();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onConfigurationDmsTabShow: function () {
			CMDBuild.proxy.administration.configuration.Dms.read({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.view.reset();
						this.view.loadRecord(Ext.create('CMDBuild.model.administration.configuration.dms.Dms', decodedResponse));

						Ext.create('CMDBuild.core.configurations.builder.Dms'); // Rebuild configuration model
					}
				}
			});
		}
	});

})();
