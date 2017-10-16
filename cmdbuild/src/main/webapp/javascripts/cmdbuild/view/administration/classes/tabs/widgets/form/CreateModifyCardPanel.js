(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.widgets.form.CreateModifyCardPanel', {
		extend: 'CMDBuild.view.administration.classes.tabs.widgets.form.AbstractWidgetDefinitionPanel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.widgets.CreateModifyCard'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.form.CreateModifyCard}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.TextArea}
		 */
		filter: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		targetClass: undefined,

		/**
		 * @returns {Array}
		 *
		 * @override
		 */
		widgetDefinitionFormAdditionalPropertiesGet: function () {
			return [
				Ext.create('Ext.form.FieldSet', {
					title: CMDBuild.Translation.additionalProperties,
					flex: 1,

					layout: {
						type: 'vbox',
						align: 'stretch'
					},

					items: [
						Ext.create('Ext.form.field.Checkbox', {
							name: CMDBuild.core.constants.Proxy.READ_ONLY,
							fieldLabel: CMDBuild.Translation.readOnly,
							labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
						}),
						this.targetClass = Ext.create('Ext.form.field.ComboBox', {
							name: CMDBuild.core.constants.Proxy.TARGET_CLASS,
							fieldLabel: CMDBuild.Translation.targetClass,
							labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
							maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
							valueField: CMDBuild.core.constants.Proxy.NAME,
							displayField: CMDBuild.core.constants.Proxy.TEXT, // TODO: waiting for refactor (rename description)
							editable: false,
							forceSelection: true,

							store: CMDBuild.proxy.administration.classes.tabs.widgets.CreateModifyCard.getStoreTargetClass(),
							queryMode: 'local'
						}),
						this.filter = Ext.create('Ext.form.field.TextArea', {
							name: CMDBuild.core.constants.Proxy.FILTER,
							fieldLabel: CMDBuild.Translation.cardCqlSelector,
							labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
							maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG
						})
					]
				})
			];
		}
	});

})();
