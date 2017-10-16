(function () {

	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.interfaces.FormSubmit',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.common.panel.gridAndForm.Print',
			'CMDBuild.proxy.index.Json'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelGridAndFormPrintWindowDownloadButtonClick',
			'onPanelGridAndFormPrintWindowShow',
			'panelGridAndFormPrintWindowShow'
		],

		/**
		 * @property {Array}
		 */
		browserManagedFormats: [
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.CSV
		],

		/**
		 * @cfg {String}
		 */
		format: CMDBuild.core.constants.Proxy.PDF,

		/**
		 * @cfg {Boolean}
		 */
		forceDownload: false,

		/**
		 * @property {Array}
		 */
		managedFormats: [
			CMDBuild.core.constants.Proxy.CSV,
			CMDBuild.core.constants.Proxy.ODT,
			CMDBuild.core.constants.Proxy.PDF,
			CMDBuild.core.constants.Proxy.RTF
		],

		/**
		 * Utilization mode
		 *
		 * @cfg {String}
		 */
		mode: undefined,

		/**
		 * @cfg {Object}
		 */
		params: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.print.WindowView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.print.WindowView', { delegate: this });
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		createDocument: function () {
			this.decodeMode()({
				params: this.params,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.showReport();
				}
			});
		},

		/**
		 * @returns {Function}
		 *
		 * @private
		 */
		decodeMode: function () {
			switch (this.mode) {
				case 'cardDetails':
					return CMDBuild.proxy.common.panel.gridAndForm.Print.createCardDetails;

				case 'classSchema':
					return CMDBuild.proxy.common.panel.gridAndForm.Print.createClassSchema;

				case 'dataViewSql':
					return CMDBuild.proxy.common.panel.gridAndForm.Print.createDataViewSqlSchema;

				case 'schema':
					return CMDBuild.proxy.common.panel.gridAndForm.Print.createSchema;

				case 'view':
					return CMDBuild.proxy.common.panel.gridAndForm.Print.createView;

				default: {
					_error('decodeMode(): unmanaged mode property', this, this.mode);

					return Ext.EmptyFn;
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormPrintWindowDownloadButtonClick: function () {
			this.forceDownload = true;

			this.createDocument();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormPrintWindowShow: function () {
			this.forceDownload = false; // Reset value on show

			if (!Ext.isEmpty(this.format))
				this.createDocument();
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.format
		 * @param {Object} parameters.mode
		 * @param {Object} parameters.params
		 *
		 * @returns {Void}
		 */
		panelGridAndFormPrintWindowShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.format = Ext.isString(parameters.format) && Ext.Array.contains(this.managedFormats, parameters.format)
				? parameters.format : CMDBuild.core.constants.Proxy.PDF;
			parameters.mode = Ext.isString(parameters.mode) ? parameters.mode : null;
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};

			Ext.apply(this, parameters);

			if (!Ext.isEmpty(this.view))
				if (Ext.Array.contains(this.browserManagedFormats, this.format)) { // With browser managed formats show modal pop-up
					this.view.show();
				} else { // Otherwise force file download
					this.forceDownload = true;

					this.createDocument();
				}
		},

		/**
		 * Get created report from server and display it in iframe
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		showReport: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.FORCE_DOWNLOAD_PARAM_KEY] = true;

			if (this.forceDownload) { // Force download mode
				CMDBuild.core.interfaces.FormSubmit.submit({
					buildRuntimeForm: true,
					params: params,
					url: CMDBuild.proxy.index.Json.report.factory.print
				});
			} else { // Add to view display mode
				this.view.removeAll();

				this.view.add({
					xtype: 'component',

					autoEl: {
						tag: 'iframe',
						src: CMDBuild.proxy.index.Json.report.factory.print
					}
				});
			}
		}
	});

})();
