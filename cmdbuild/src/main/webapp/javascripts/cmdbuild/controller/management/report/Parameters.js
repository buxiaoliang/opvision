(function () {

	Ext.define('CMDBuild.controller.management.report.Parameters', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		uses: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Mixed}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'reportParametersWindowReconfigureAndShow',
			'onReportParametersWindowAbortButtonClick',
			'onReportParametersWindowPrintButtonClick'
		],

		/**
		 * @cfg {Boolean}
		 */
		forceDownload: false,

		/**
		 * @property {Ext.form.Panel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.management.report.ParametersWindow} emailWindows
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Mixed} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.report.ParametersWindow', { delegate: this });

			// ShortHands
			this.form = this.view.form;
		},

		/**
		 * @param {Array} attributes
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFields: function (attributes) {
			// Error handling
				if (!Ext.isArray(attributes) || Ext.isEmpty(attributes))
					return _error('buildFields(): unmanaged attributes parameter', this, attributes);
			// END: Error handling

			var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', {
					parentDelegate: this,
					targetForm: this.form
				}),
				fields = [];

			Ext.Array.each(attributes, function (attribute, i, allAttributes) {
				if (fieldManager.isAttributeManaged(attribute[CMDBuild.core.constants.Proxy.TYPE])) {
					fieldManager.attributeModelSet(Ext.create('CMDBuild.model.common.attributes.Attribute', attribute));
					fieldManager.push(fields, fieldManager.buildField());
				} else { // @deprecated - Old field manager
					attribute = this.validateFilterProperty(attribute);

					var field = CMDBuild.Management.FieldManager.getFieldForAttr(attribute, false, false);

					if (!Ext.isEmpty(field)) {
						field.maxWidth = field.width || CMDBuild.core.constants.FieldWidths.STANDARD_BIG;

						if (attribute.defaultvalue)
							field.setValue(attribute.defaultvalue);

						fields.push(field);
					}
				}
			}, this);

			this.form.removeAll();
			this.form.add(fields);
		},

		/**
		 * @returns {Void}
		 */
		onReportParametersWindowAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onReportParametersWindowPrintButtonClick: function () {
			if (this.view.form.getForm().isValid()) {
				this.cmfg('selectedReportParametersSet', {
					callIdentifier: 'update',
					params: this.form.getValues()
				});

				this.cmfg('updateReport', this.forceDownload);

				this.cmfg('onReportParametersWindowAbortButtonClick');
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Array} parameters.attributes
		 * @param {Boolean} parameters.forceDownload
		 *
		 * @returns {Void}
		 */
		reportParametersWindowReconfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.forceDownload = Ext.isBoolean(parameters.forceDownload) ? parameters.forceDownload : false;

			this.forceDownload = parameters.forceDownload;

			this.setViewTitle(this.cmfg('selectedReportRecordGet', CMDBuild.core.constants.Proxy.DESCRIPTION));

			this.buildFields(parameters.attributes);

			this.view.show();
		},

		/**
		 * Removes filter property if present template
		 *
		 * @param {Object} attribute
		 *
		 * @returns {Object} attribute
		 *
		 * @private
		 */
		validateFilterProperty: function (attribute) {
			if (
				Ext.isObject(attribute) && !Ext.Object.isEmpty(attribute)
				&& Ext.isString(attribute[CMDBuild.core.constants.Proxy.FILTER]) && !Ext.isEmpty(attribute[CMDBuild.core.constants.Proxy.FILTER])
				&& CMDBuild.core.templateResolver.Utils.hasTemplates(attribute[CMDBuild.core.constants.Proxy.FILTER])
			) {
				attribute[CMDBuild.core.constants.Proxy.FILTER] = null;
			}

			return attribute;
		}
	});

})();
