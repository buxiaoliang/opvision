(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.CreateModifyCard', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.model.administration.classes.tabs.widgets.createModifyCard.Definition'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesTabWidgetsWidgetAdd',
			'classesTabWidgetsWidgetCreateModifyCardDefinitionGet = classesTabWidgetsWidgetDefinitionGet',
			'classesTabWidgetsWidgetCreateModifyCardLoadRecord = classesTabWidgetsWidgetLoadRecord',
			'classesTabWidgetsWidgetCreateModifyCardValidateForm = classesTabWidgetsValidateForm',
			'classesTabWidgetsWidgetDefinitionModelNameGet'
		],

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: 'CMDBuild.model.administration.classes.tabs.widgets.createModifyCard.Definition',

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.widgets.form.CreateModifyCardPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.tabs.widgets.Widgets} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.CreateModifyCardPanel', { delegate: this });
		},

		/**
		 * @returns {Object}
		 */
		classesTabWidgetsWidgetCreateModifyCardDefinitionGet: function () {
			return CMDBuild.model.administration.classes.tabs.widgets.createModifyCard.Definition.convertToLegacy(
				Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet'), this.view.getData(true)).getData()
			);
		},

		/**
		 * Fills form with widget data
		 *
		 * @param {CMDBuild.model.administration.classes.tabs.widgets.createModifyCard.Definition} record
		 *
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetCreateModifyCardLoadRecord: function (record) {
			this.view.loadRecord(record);
		},

		/**
		 * @param {CMDBuild.view.administration.classes.tabs.widgets.form.CreateModifyCardPanel} form
		 *
		 * @returns {Boolean}
		 */
		classesTabWidgetsWidgetCreateModifyCardValidateForm: function (form) {
			var formValues = this.view.getData(true);

			if (
				Ext.isEmpty(formValues[CMDBuild.core.constants.Proxy.TARGET_CLASS])
				&& Ext.isEmpty(formValues[CMDBuild.core.constants.Proxy.FILTER])
			) {
				this.view.filter.markInvalid(CMDBuild.Translation.errors.requiredFieldMessage);
				this.view.targetClass.markInvalid(CMDBuild.Translation.errors.requiredFieldMessage);

				CMDBuild.core.Message.error(
					CMDBuild.Translation.common.failure,
					CMDBuild.Translation.errors.targetClassOrCqlFilterRequired,
					false
				);

				return false;
			}

			return this.validate(form);
		}
	});

})();
