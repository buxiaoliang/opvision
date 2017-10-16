(function () {

	/**
	 * @link CMDBuild.controller.administration.workflow.tabs.Properties
	 */
	Ext.define('CMDBuild.controller.administration.classes.tabs.Properties', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.Classes'
		],

		mixins: ['CMDBuild.controller.administration.classes.tabs.Icons'], // FIXME: Waiting for a future full implementation as separate tab

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onClassesTabPropertiesAbortButtonClick',
			'onClassesTabPropertiesAddClassButtonClick',
			'onClassesTabPropertiesClassSelected',
			'onClassesTabPropertiesIconsClassSelection', // FIXME: Waiting for a future full implementation as separate tab
			'onClassesTabPropertiesIconsUploadButtonClick', // FIXME: Waiting for a future full implementation as separate tab
			'onClassesTabPropertiesModifyButtonClick',
			'onClassesTabPropertiesPrintButtonClick',
			'onClassesTabPropertiesRemoveButtonClick',
			'onClassesTabPropertiesSaveButtonClick',
			'onClassesTabPropertiesShow',
			'onClassesTabPropertiesTableTypeSelectionChange'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.IconsPanel}
		 */
		panelIcons: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.BasePropertiesPanel}
		 */
		panelProperties: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.properties.PropertiesView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.Classes} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.properties.PropertiesView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
			this.panelIcons = this.view.form.panelIcons;
			this.panelProperties = this.view.form.panelProperties;

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
		},

		/**
		 * Hide unnecessary fields for simple classes
		 *
		 * @param {String} tableType
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		manageFieldsBySelectedTableType: function (tableType) {
			if (Ext.isString(tableType) && !Ext.isEmpty(tableType)) {
				this.panelProperties.isSuperClassField.setVisible(tableType == CMDBuild.core.constants.Global.getTableTypeStandardTable());
				this.panelProperties.parentCombo.setVisible(tableType == CMDBuild.core.constants.Global.getTableTypeStandardTable());
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesAbortButtonClick: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty')) {
				this.cmfg('onClassesTabPropertiesShow');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesAddClassButtonClick: function () {
			// Base properties fieldset setup
				this.form.reset();
				this.form.loadRecord(Ext.create('CMDBuild.model.classes.Class'));
				this.form.setDisabledModify(false, true); // Before data load to avoid disabled fields problems

				// Set parent default selection
				this.panelProperties.parentCombo.getStore().load({
					scope: this,
					callback: function (records, operation, success) {
						this.panelProperties.parentCombo.getStore().each(function (record) {
							if (record.get(CMDBuild.core.constants.Proxy.NAME) == CMDBuild.core.constants.Global.getRootNameClasses()) {
								this.panelProperties.parentCombo.setValue(record);

								return false;
							}
						}, this);
					}
				});

			// Icon fieldset setup
			this.panelIcons.setDisabledModify(true);
		},

		/**
		 * Enable/Disable tab on class selection
		 *
		 * @returns {Void}
		 */
		onClassesTabPropertiesClassSelected: function () {
			this.view.enable();

			this.form.reset();

			if (!this.cmfg('classesSelectedClassIsEmpty'))
				this.manageFieldsBySelectedTableType(this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.TABLE_TYPE));
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesModifyButtonClick: function () {
			this.form.setDisabledModify(false);
			this.panelIcons.setDisabledModify(false);
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onClassesTabPropertiesPrintButtonClick: function (format) {
			if (Ext.isString(format) && !Ext.isEmpty(format)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.FORMAT] = format;

				this.controllerPrintWindow.cmfg('panelGridAndFormPrintWindowShow', {
					format: format,
					mode: 'classSchema',
					params: params
				});
			} else {
				_error('onClassesTabPropertiesPrintButtonClick(): unmanaged format property', this, format);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesRemoveButtonClick: function () {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesSaveButtonClick: function () {
			if (this.validate(this.panelProperties)) {
				var formDataModel = Ext.create('CMDBuild.model.classes.Class', this.panelProperties.getData(true));

				var params = formDataModel.getData();
				params['inherits'] = params[CMDBuild.core.constants.Proxy.PARENT];
				params['isprocess'] = false;
				params['superclass'] = params[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS];

				if (Ext.isEmpty(formDataModel.get(CMDBuild.core.constants.Proxy.ID))) {
					params[CMDBuild.core.constants.Proxy.FORCE_CREATION] = true;

					CMDBuild.proxy.administration.classes.Classes.create({
						params: params,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.classes.Classes.update({
						params: params,
						scope: this,
						success: this.success
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesTableTypeSelectionChange: function () {
			this.manageFieldsBySelectedTableType(this.panelProperties.tableTypeCombo.getValue());
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesShow: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty')) {
				// Base properties fieldset setup
					this.form.reset();
					this.form.setDisabledModify(true, true);
					this.form.loadRecord(this.cmfg('classesSelectedClassGet'));

				// Icon fieldset setup
					this.cmfg('onClassesTabPropertiesIconsClassSelection'); // FIXME: Waiting for a future full implementation as separate tab
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.administration.classes.Classes.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('classesSelectedClassReset');

						this.form.reset();
						this.form.setDisabledModify(true, true, true, true);

						this.cmfg('mainViewportAccordionDeselect', this.cmfg('classesIdentifierGet'));
						this.cmfg('mainViewportAccordionControllerUpdateStore', { identifier: this.cmfg('classesIdentifierGet') });
					}
				});
			}
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		success: function (response, options, decodedResponse) {
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.TABLE];

			CMDBuild.view.common.field.translatable.Utils.commit(this.panelProperties);

			this.cmfg('mainViewportAccordionDeselect', this.cmfg('classesIdentifierGet'));
			this.cmfg('mainViewportAccordionControllerUpdateStore', {
				identifier: this.cmfg('classesIdentifierGet'),
				params: {
					selectionId: decodedResponse[CMDBuild.core.constants.Proxy.ID]
				}
			});
		}
	});

})();
