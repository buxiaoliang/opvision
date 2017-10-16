(function () {

	Ext.define('CMDBuild.controller.management.widget.openReport.OpenReport', {
		extend:'CMDBuild.controller.common.abstract.Widget',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.widget.openReport.OpenReport'
		],

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'beforeHideView',
			'getData',
			'isValid',
			'onBeforeSave',
			'onEditMode',
			'onWidgetOpenReportBeforeActiveView = beforeActiveView',
			'onWidgetOpenReportSaveButtonClick',
			'widgetConfigurationGet = widgetOpenReportConfigurationGet',
			'widgetConfigurationIsEmpty = widgetOpenReportConfigurationIsEmpty'
		],

		/**
		 * @property {CMDBuild.controller.management.widget.openReport.Modal}
		 */
		controllerWindowModal: undefined,

		/**
		 * @property {CMDBuild.view.management.widget.openReport.OpenReportView}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.openReport.Configuration',

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.common.CMWidgetManagerController} configurationObject.parentDelegate
		 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} configurationObject.card
		 * @param {Ext.form.Basic} configurationObject.clientForm
		 * @param {CMDBuild.view.management.widget.openReport.OpenReportView} configurationObject.view
		 * @param {Object} configurationObject.widgetConfiguration
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			// Build sub-controllers
			this.controllerWindowModal = Ext.create('CMDBuild.controller.management.widget.openReport.Modal', { parentDelegate: this });
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		onWidgetOpenReportBeforeActiveView: function () {
			this.beforeActiveView(arguments); // CallParent alias

			if (!this.cmfg('widgetOpenReportConfigurationIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CODE] = this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.REPORT_CODE);
				params[CMDBuild.core.constants.Proxy.TYPE] = CMDBuild.core.constants.Proxy.CUSTOM;

				CMDBuild.proxy.management.widget.openReport.OpenReport.createFactory({
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (response, options, decodedResponse) {
						if (!decodedResponse[CMDBuild.core.constants.Proxy.FILLED])
							this.configureForm(decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTE]);

						new CMDBuild.Management.TemplateResolver({
							clientForm: this.clientForm,
							xaVars: this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.PRESET),
							serverVars: this.getTemplateResolverServerVars()
						}).resolveTemplates({
							attributes: Ext.Object.getKeys(this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.PRESET)),
							scope: this,
							callback: function (out, ctx) {
								this.fillFormValues(out);
								this.forceExtension(this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.FORCE_FORMAT));
							}
						});
					}
				});
			}
		},

		/**
		 * Build server call to configure and create reports
		 *
		 * @returns {Void}
		 */
		onWidgetOpenReportSaveButtonClick: function () {
			if (this.validate(this.view)) {
				var params = Ext.apply(this.view.getData(true), this.view.getValues()); // Cannot use only getData() because of date field format errors
				params[CMDBuild.core.constants.Proxy.REPORT_EXTENSION] = this.view.formatCombo.getValue();

				CMDBuild.proxy.management.widget.openReport.OpenReport.update({
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (response, options, decodedResponse) { // Pop-up display mode or force download
						this.controllerWindowModal.cmfg('widgetOpenReportModalWindowConfigureAndShow', { extension: this.view.formatCombo.getValue() });
					}
				});
			}
		},

		/**
		 * Add the required attributes and disable fields if in readOnlyAttributes array
		 *
		 * @param {Array} attributes
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		configureForm: function (attributes) {
			if (!Ext.isEmpty(attributes) && Ext.isArray(attributes)) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					fields = [];

				Ext.Array.forEach(attributes, function (attribute, i, allAttributes) {
					if (fieldManager.isAttributeManaged(attribute[CMDBuild.core.constants.Proxy.TYPE])) {
						fieldManager.attributeModelSet(Ext.create('CMDBuild.model.common.attributes.Attribute', attribute));
						fieldManager.push(fields, fieldManager.buildField({
							readOnly: Ext.Array.contains( // Disable if field name is contained in widgetConfiguration.readOnlyAttributes
								this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES),
								attribute[CMDBuild.core.constants.Proxy.NAME]
							)
						}));
					} else { // @deprecated - Old field manager
						var field = CMDBuild.Management.FieldManager.getFieldForAttr(
							attribute,
							Ext.Array.contains( // Disable if field name is contained in widgetConfiguration.readOnlyAttributes
								this.cmfg('widgetOpenReportConfigurationGet', CMDBuild.core.constants.Proxy.READ_ONLY_ATTRIBUTES),
								attribute[CMDBuild.core.constants.Proxy.NAME]
							),
							false
						);

						if (!Ext.isEmpty(field)) {
							field.maxWidth = field.width || CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM;

							if (attribute.defaultvalue)
								field.setValue(attribute.defaultvalue);
						}
					}
				}, this);

				this.view.fieldContainer.removeAll();

				if (Ext.isArray(fields) && !Ext.isEmpty(fields))
					this.view.fieldContainer.add(fields);
			}
		},

		/**
		 * Fixes date format
		 *
		 * @param {Object} parameters - Ex: { input_name: value, ...}
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		fillFormValues: function (parameters) {
			if (!Ext.Object.isEmpty(parameters)) {
				Ext.Object.each(parameters, function (key, value, myself) {
					if (Ext.isDate(value))
						parameters[key] =  new Date(value);
				}, this);

				this.view.loadRecord(Ext.create('CMDBuild.model.common.Generic', parameters));
			}
		},

		/**
		 * @param {String} extension
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		forceExtension: function (extension) {
			if (!Ext.isEmpty(extension)) {
				this.view.formatCombo.setValue(extension);
				this.view.formatCombo.disable();
			} else {
				this.view.formatCombo.enable();
			}
		}
	});

})();
