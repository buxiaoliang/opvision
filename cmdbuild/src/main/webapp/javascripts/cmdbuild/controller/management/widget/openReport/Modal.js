(function () {

	Ext.define('CMDBuild.controller.management.widget.openReport.Modal', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json',
			'CMDBuild.proxy.management.widget.openReport.Modal'
		],

		/**
		 * @cfg {CMDBuild.controller.management.widget.openReport.OpenReport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		browserManagedFormats: [
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.CSV
		],

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWidgetOpenReportModalWindowDownloadButtonClick',
			'widgetOpenReportModalWindowConfigureAndShow'
		],

		/**
		 * @cfg {String}
		 */
		extension: CMDBuild.core.constants.Proxy.PDF,

		/**
		 * @property {CMDBuild.view.management.widget.openReport.ModalWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.widget.openReport.OpenReport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.widget.openReport.ModalWindow', { delegate: this });
		},

		/**
		 * @param {Boolean} forceDownload
		 *
		 * @returns {Void}
		 */
		onWidgetOpenReportModalWindowDownloadButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.FORCE_DOWNLOAD_PARAM_KEY] = true;

			CMDBuild.proxy.management.widget.openReport.Modal.download({
				buildRuntimeForm: true,
				params: params,
				loadMask: this.view
			});
		},

		/**
		 * @param {Object} parameters
		 * @param {String} parameters.extension
		 *
		 * @returns {Void}
		 */
		widgetOpenReportModalWindowConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isObject(this.view) || Ext.Object.isEmpty(this.view))
					return _error('widgetOpenReportModalWindowConfigureAndShow(): unmanaged view property', this, this.view);
			// END: Error handling

			if (Ext.isString(parameters.extension) && !Ext.isEmpty(parameters.extension) && Ext.Array.contains(this.browserManagedFormats, parameters.extension)) {
				this.setViewTitle(this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.LABEL));

				this.view.removeAll();
				this.view.add({
					xtype: 'component',

					autoEl: {
						tag: 'iframe',
						src: CMDBuild.proxy.index.Json.report.factory.print + '?donotdelete=true' // Add parameter to avoid report delete
					}
				});
				this.view.show();
			} else { // Extension not managed from browser
				this.cmfg('onWidgetOpenReportModalWindowDownloadButtonClick');
			}
		}
	});

})();
