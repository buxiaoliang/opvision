(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.event.asynchronous.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step1}
		 */
		delegate: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		defaults: {
			maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
			anchor: '100%'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			var me = this;

			this.typeField = Ext.create('Ext.form.field.Text', {
				fieldLabel: CMDBuild.Translation.type,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: CMDBuild.core.constants.Proxy.TYPE,
				value: CMDBuild.Translation.eventAsynchronous,
				disabled: true,
				cmImmutable: true,
				readOnly: true,
				submitValue: false
			});

			this.idField = Ext.create('Ext.form.field.Hidden', {
				name: CMDBuild.core.constants.Proxy.ID
			});

			this.descriptionField = Ext.create('Ext.form.field.Text', {
				name: CMDBuild.core.constants.Proxy.DESCRIPTION,
				fieldLabel: CMDBuild.Translation.descriptionLabel,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				allowBlank: false
			});

			this.activeField = Ext.create('Ext.form.field.Checkbox', {
				name: CMDBuild.core.constants.Proxy.ACTIVE,
				fieldLabel: CMDBuild.Translation.startOnSave,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
			});

			this.classNameCombo = Ext.create('Ext.form.field.ComboBox', {
				name: CMDBuild.core.constants.Proxy.CLASS_NAME,
				fieldLabel: CMDBuild.Translation.classLabel,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
				allowBlank: false,
				forceSelection: true,
				editable: false,

				store: _CMCache.getClassesAndProcessesStore(),
				queryMode: 'local',

				listeners: {
					select: function (combo, records, options) {
						me.delegate.cmfg('onTaskManagerFormTaskEventAsynchronousClassSelected', this.getValue());
					}
				}
			});

			Ext.apply(this, {
				items: [
					this.typeField,
					this.idField,
					this.descriptionField,
					this.activeField,
					this.classNameCombo
				]
			});

			this.callParent(arguments);
		}
	});

})();
