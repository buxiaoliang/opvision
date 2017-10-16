(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.Versions', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Attachment'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentVersionsCloseButtonClick',
			'onPanelModuleAttachmentVersionsDownloadButtonClick',
			'panelModuleAttachmentVersionsConfigureAndShow'
		],

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.versions.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.versions.VersionsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.module.attachment.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.versions.VersionsView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentVersionsCloseButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} record
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentVersionsDownloadButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onPanelModuleAttachmentVersionsDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.FILE_NAME] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);
			params[CMDBuild.core.constants.Proxy.VERSION] = record.get(CMDBuild.core.constants.Proxy.VERSION);

			CMDBuild.proxy.common.panel.module.attachment.Attachment.download({ params: params });
		},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} parameters.record
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentVersionsConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('panelModuleAttachmentVersionsConfigureAndShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('panelModuleAttachmentVersionsConfigureAndShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));

				if (!Ext.isObject(parameters.record) || Ext.Object.isEmpty(parameters.record))
					return _error('panelModuleAttachmentVersionsConfigureAndShow(): unmanaged record parameter', this, parameters.record);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.FILE_NAME] = parameters.record.get(CMDBuild.core.constants.Proxy.FILE_NAME);

			this.grid.getStore().removeAll(); // Avoid old rows display untill end of load
			this.grid.getStore().load({ params: params });

			this.view.show();
		}
	});

})();
