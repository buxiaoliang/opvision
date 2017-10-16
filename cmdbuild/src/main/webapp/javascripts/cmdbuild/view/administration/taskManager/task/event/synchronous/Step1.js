(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.event.synchronous.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.event.Synchronous'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.synchronous.Step1}
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
				name: CMDBuild.core.constants.Proxy.TYPE,
				fieldLabel: CMDBuild.Translation.type,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				value: CMDBuild.Translation.eventSynchronous,
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

			this.phaseCombo = Ext.create('Ext.form.field.ComboBox', {
				name: CMDBuild.core.constants.Proxy.PHASE,
				fieldLabel: CMDBuild.Translation.phase,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				store: CMDBuild.proxy.administration.taskManager.task.event.Synchronous.getStorePhases(),
				valueField: CMDBuild.core.constants.Proxy.VALUE,
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
				queryMode: 'local',
				forceSelection: true,
				editable: false
			});

			this.groups = Ext.create('CMDBuild.view.common.field.CMGroupSelectionList', {
				name: CMDBuild.core.constants.Proxy.GROUPS,
				fieldLabel: CMDBuild.Translation.groupsToApply,
				height: 300,
				valueField: CMDBuild.core.constants.Proxy.NAME,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
				considerAsFieldToDisable: true,
				anchor: '100%'
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

				store: _CMCache.getClassesStore(),
				queryMode: 'local',

				listeners: {
					select: function (combo, records, options) {
						me.delegate.cmfg('onTaskManagerFormTaskEventSynchronousClassSelected', this.getValue());
					}
				}
			});

			Ext.apply(this, {
				items: [
					this.typeField,
					this.idField,
					this.descriptionField,
					this.activeField,
					this.phaseCombo,
					this.groups,
					this.classNameCombo
				]
			});

			this.callParent(arguments);
		}
	});

})();
