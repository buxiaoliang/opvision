(function(){
	
	Ext.define('CMDBuild.view.management.common.filter.CMSaveFilterWindow', {
		extend: 'Ext.window.Window',

		mixins: {
			delegable: 'CMDBuild.core.CMDelegable'
		},

		bodyPadding: '5 5 1 5',
		buttonAlign: 'center',
		modal: true,

		// Configuration
			/**
			 * a CMDBuild.model.CMFilterModel
			 */
			filter: undefined,

			/**
			 * a CMFilterWindow, used outside to know the referred filter window and close it
			 */
			referredFilterWindow: undefined,
		// END: Configuration

		constructor: function() {
			this.mixins.delegable.constructor.call(this, 'CMDBuild.view.management.common.filter.CMSaveFilterWindowDelegate');

			this.callParent(arguments);
		},

		initComponent: function() {
			var me = this;
			var canEditTheName = this.filter.isLocal();

			this.nameField = Ext.create('Ext.form.field.Text', {
				name: CMDBuild.core.constants.Proxy.NAME,
				fieldLabel: CMDBuild.Translation.administration.modClass.attributeProperties.name,
				value: this.filter.getName(),
				disabled: !canEditTheName,
				width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				allowBlank: false // Requires a non-empty value
			});

			this.descriptionField = Ext.create('Ext.form.field.TextArea', {
				name: CMDBuild.core.constants.Proxy.DESCRIPTION,
				fieldLabel: CMDBuild.Translation.administration.modClass.attributeProperties.description,
				value: this.filter.getDescription(),
				width: CMDBuild.core.constants.FieldWidths.STANDARD_BIG,
				allowBlank: false // Requires a non-empty value
			});

			this.items = [this.nameField, this.descriptionField];

			this.buttons = [
				{
					text: CMDBuild.Translation.save,
					handler: function() {
						var name = me.nameField.getValue();
						var description = me.descriptionField.getValue();

						me.callDelegates('onSaveFilterWindowConfirm', [me, me.filter, name, description]);
					}
				},
				{
					text: CMDBuild.Translation.cancel,
					handler: function() {
						me.destroy();
					}
				}
			];

			this.callParent(arguments);
		}
	});
	
})();